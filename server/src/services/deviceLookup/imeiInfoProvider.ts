import type { DeviceLookupOutcome, DeviceLookupProvider, NormalizedDeviceSpecs } from './types';

const REQUEST_TIMEOUT_MS = 8000;
const MAX_POLL_ATTEMPTS = 4;
const POLL_INTERVAL_MS = 1500;

// Never log a full IMEI or API key — only enough to correlate support tickets.
function maskImei(imei: string): string {
  return `${imei.slice(0, 4)}...${imei.slice(-2)}`;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function readPath(source: unknown, path: string): unknown {
  const value = path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc && typeof acc === 'object' ? (acc as Record<string, unknown>)[key] : undefined),
      source,
    );
  return value === undefined || value === '' ? null : value;
}

function pickString(source: unknown, ...paths: string[]): string | null {
  for (const path of paths) {
    const value = readPath(source, path);
    if (value !== null && value !== undefined) {
      return String(value);
    }
  }
  return null;
}

function pickBoolean(source: unknown, ...paths: string[]): boolean | null {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      if (/^(true|yes|1)$/i.test(value)) return true;
      if (/^(false|no|0)$/i.test(value)) return false;
    }
  }
  return null;
}

function pickNumber(source: unknown, ...paths: string[]): number | null {
  for (const path of paths) {
    const value = readPath(source, path);
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

// Best-effort mapping from IMEI.info's `result` object to our internal schema.
//
// UNVERIFIED FIELD NAMES: IMEI.info's public Swagger spec
// (https://dash.imei.info/swagger/?format=openapi) documents the request/response
// *envelope* (status codes, polling via search_history, billing semantics) but
// leaves `result` as an opaque, untyped object whose actual shape depends on which
// numeric `service` id you call. Discovering the real field names requires an
// authenticated call to /api/service/services/, which needs a live paid account —
// not available while building this. Their advertised "official" Node SDK
// (npm install imei-info) does not exist on the npm registry, so it could not be
// used to confirm the shape either.
//
// The paths below are a best-effort placeholder using common naming conventions
// for this niche. Every lookup safely resolves to `null` for anything that isn't
// present — never fabricated — so a wrong guess here degrades to "not identified"
// rather than showing incorrect specs. Once real account access is available,
// replace the path lists below with the verified ones from one actual response.
function normalize(imei: string, result: Record<string, unknown>): NormalizedDeviceSpecs {
  return {
    imei,
    brand: pickString(result, 'brand', 'manufacturer', 'brand_name'),
    model: pickString(result, 'model', 'model_name', 'device_name'),
    modelNumber: pickString(result, 'model_number', 'modelNumber'),
    deviceType: pickString(result, 'device_type', 'type'),
    releaseDate: pickString(result, 'release_date', 'released'),
    os: pickString(result, 'os', 'operating_system'),
    osVersion: pickString(result, 'os_version', 'osVersion'),
    ram: pickString(result, 'ram', 'ram_gb'),
    storage: pickString(result, 'storage', 'internal_storage'),
    color: null,
    display: {
      size: pickString(result, 'display.size', 'display_size'),
      resolution: pickString(result, 'display.resolution', 'display_resolution'),
      type: pickString(result, 'display.type', 'display_type'),
    },
    processor: {
      chipset: pickString(result, 'chipset', 'processor'),
      cpu: pickString(result, 'cpu'),
      gpu: pickString(result, 'gpu'),
    },
    camera: {
      rear: pickString(result, 'camera.rear', 'main_camera', 'rear_camera'),
      front: pickString(result, 'camera.front', 'selfie_camera', 'front_camera'),
    },
    battery: {
      capacity: pickString(result, 'battery.capacity', 'battery_capacity', 'battery'),
    },
    network: {
      '2G': pickBoolean(result, 'network.2g', '2g'),
      '3G': pickBoolean(result, 'network.3g', '3g'),
      '4G': pickBoolean(result, 'network.4g', '4g'),
      '5G': pickBoolean(result, 'network.5g', '5g'),
    },
    connectivity: {
      simType: pickString(result, 'sim_type', 'simType'),
      simCount: pickNumber(result, 'sim_count', 'simCount'),
      esim: pickBoolean(result, 'esim'),
      wifi: pickString(result, 'wifi'),
      bluetooth: pickString(result, 'bluetooth'),
      nfc: pickBoolean(result, 'nfc'),
      usb: pickString(result, 'usb'),
    },
    dimensions: {
      height: pickString(result, 'dimensions.height', 'height'),
      width: pickString(result, 'dimensions.width', 'width'),
      thickness: pickString(result, 'dimensions.thickness', 'thickness'),
    },
    weight: pickString(result, 'weight'),
    source: 'imei-info',
  };
}

export class ImeiInfoProvider implements DeviceLookupProvider {
  name = 'imei-info';

  async lookupByImei(imei: string): Promise<DeviceLookupOutcome> {
    const apiKey = process.env.IMEI_API_KEY;
    const baseUrl = process.env.IMEI_API_BASE_URL;
    const serviceId = process.env.IMEI_API_SERVICE_ID;

    if (!apiKey || !baseUrl || !serviceId) {
      return { ok: false, error: 'unavailable' };
    }

    try {
      const checkUrl = `${baseUrl}/api/check/${encodeURIComponent(serviceId)}/?API_KEY=${encodeURIComponent(
        apiKey,
      )}&imei=${encodeURIComponent(imei)}`;
      let response = await fetchWithTimeout(checkUrl, REQUEST_TIMEOUT_MS);

      if (response.status === 202) {
        const queued = (await response.json()) as { history_id?: string | number; ulid?: string };
        const historyId = queued.ulid ?? queued.history_id;
        let settled = false;

        for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS && historyId; attempt++) {
          await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
          const pollUrl = `${baseUrl}/api/search_history/${encodeURIComponent(
            String(historyId),
          )}/?API_KEY=${encodeURIComponent(apiKey)}`;
          response = await fetchWithTimeout(pollUrl, REQUEST_TIMEOUT_MS);
          if (response.status === 200) {
            const body = (await response.json()) as { status?: string; result?: unknown };
            if (body.status === 'Done') {
              settled = true;
              return this.handleResult(imei, body.result);
            }
            if (body.status === 'Rejected' || body.status === 'Refunded') {
              return { ok: false, error: 'not-found' };
            }
          }
        }

        if (!settled) {
          console.error(`[imei-info] lookup ${maskImei(imei)} still pending after polling — treating as timeout`);
          return { ok: false, error: 'timeout' };
        }
      }

      if (response.status === 401 || response.status === 403) {
        console.error(`[imei-info] authentication failed for lookup ${maskImei(imei)}`);
        return { ok: false, error: 'auth-error' };
      }
      if (response.status === 402) {
        console.error(`[imei-info] insufficient credits for lookup ${maskImei(imei)}`);
        return { ok: false, error: 'quota-exceeded' };
      }
      if (response.status === 422) {
        return { ok: false, error: 'invalid-imei' };
      }
      if (response.status === 404) {
        return { ok: false, error: 'not-found' };
      }
      if (!response.ok) {
        console.error(`[imei-info] unexpected status ${response.status} for lookup ${maskImei(imei)}`);
        return { ok: false, error: 'unavailable' };
      }

      const body = (await response.json()) as { result?: unknown };
      return this.handleResult(imei, body.result);
    } catch (err) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      if (isAbort) {
        console.error(`[imei-info] request timed out for lookup ${maskImei(imei)}`);
        return { ok: false, error: 'timeout' };
      }
      console.error(
        `[imei-info] request failed for lookup ${maskImei(imei)}:`,
        err instanceof Error ? err.message : err,
      );
      return { ok: false, error: 'unavailable' };
    }
  }

  private handleResult(imei: string, result: unknown): DeviceLookupOutcome {
    if (!result || typeof result !== 'object') {
      return { ok: false, error: 'not-found' };
    }
    const specs = normalize(imei, result as Record<string, unknown>);
    if (!specs.brand && !specs.model) {
      // Provider answered but didn't actually identify anything useful.
      return { ok: false, error: 'not-found' };
    }
    return { ok: true, specs };
  }
}

// Exported for a future test / manual sanity-check once a real response shape
// is available — not used by production code paths.
export const __internal = { normalize };
