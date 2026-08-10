import { DeviceMaster } from '../../models/DeviceMaster';
import type { DeviceLookupOutcome, DeviceLookupProvider, NormalizedDeviceSpecs } from './types';
import { emptyNormalizedSpecs } from './types';
import { ImeiInfoProvider } from './imeiInfoProvider';
import { DeviceAtlasProvider } from './deviceAtlasProvider';

// imei.info is the configured default when its env vars are present. DeviceAtlas
// stays available as a second, swappable option (see deviceAtlasProvider.ts for
// why it's currently inert). Neither the RN app nor the rest of the backend
// needs to change when this factory's choice changes.
export function getDeviceLookupProvider(): DeviceLookupProvider | null {
  if (process.env.IMEI_API_KEY && process.env.IMEI_API_BASE_URL && process.env.IMEI_API_SERVICE_ID) {
    return new ImeiInfoProvider();
  }
  if (process.env.DEVICE_LOOKUP_PROVIDER === 'deviceatlas' && process.env.DEVICEATLAS_API_KEY) {
    return new DeviceAtlasProvider();
  }
  return null;
}

function cachedToNormalized(imei: string, cached: any): NormalizedDeviceSpecs {
  if (cached.fullSpecs) {
    return { ...(cached.fullSpecs as object), imei, color: null, source: 'device-master' } as NormalizedDeviceSpecs;
  }
  return {
    ...emptyNormalizedSpecs(imei, 'device-master'),
    brand: cached.brand ?? null,
    model: cached.model ?? null,
    ram: cached.ram || null,
    storage: cached.storage || null,
  };
}

async function upsertDeviceMaster(tac: string, specs: NormalizedDeviceSpecs): Promise<void> {
  if (!specs.brand || !specs.model) {
    // Don't cache an incomplete identification — a future purchase should
    // still get a chance at a real match instead of inheriting a blank entry.
    return;
  }
  const { imei: _imei, color: _color, source, ...fullSpecs } = specs;
  await DeviceMaster.updateOne(
    { tac },
    {
      $setOnInsert: { source },
      $set: {
        brand: specs.brand,
        model: specs.model,
        ram: specs.ram ?? '',
        storage: specs.storage ?? '',
        fullSpecs,
      },
    },
    { upsert: true },
  );
}

// Shared by both the shop-scoped Add Purchase lookup and the standalone
// POST /api/device/lookup endpoint: check the local cache first (free, no
// external dependency), fall through to the configured provider, and learn
// from any real answer so the next lookup of the same TAC is instant.
export async function lookupDeviceSpecs(imei: string): Promise<DeviceLookupOutcome> {
  const tac = imei.slice(0, 8);

  const cached = await DeviceMaster.findOne({ tac });
  if (cached) {
    return { ok: true, specs: cachedToNormalized(imei, cached) };
  }

  const provider = getDeviceLookupProvider();
  if (!provider) {
    return { ok: false, error: 'not-found' };
  }

  const outcome = await provider.lookupByImei(imei);
  if (outcome.ok) {
    await upsertDeviceMaster(tac, outcome.specs).catch(err => {
      console.error('DeviceMaster upsert failed for tac', tac, err);
    });
  }
  return outcome;
}

export type {
  DeviceLookupProvider,
  DeviceLookupOutcome,
  DeviceLookupErrorType,
  NormalizedDeviceSpecs,
} from './types';
