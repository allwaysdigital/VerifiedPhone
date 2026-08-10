import type { DeviceLookupOutcome, DeviceLookupProvider } from './types';

// Best-effort DeviceAtlas adapter.
//
// DeviceAtlas's public REST API (deviceatlas.com/resources/rest-api) is a
// metadata/reference API — property-value dictionaries, Apple hardware
// identifier lists — authenticated with HTTP Basic auth, not a live
// "send a TAC, get device specs back" endpoint. Their actual device
// identification product ships as an embeddable Enterprise SDK (using a
// downloaded local data file) or a separately-licensed carrier "Device Map"
// (TAC database), both of which require a paid account with docs that
// aren't publicly available.
//
// This class exists so the lookup workflow has a real, swappable seam for
// DeviceAtlas (or any future provider) — but it intentionally never makes a
// network call until a verified request/response contract is available. It
// never throws; callers always get "not-found" and fall through to the local
// Device Master cache / manual entry, exactly as designed. imei.info is the
// configured default (see imeiInfoProvider.ts); this stays available as a
// second, swappable option.
export class DeviceAtlasProvider implements DeviceLookupProvider {
  name = 'deviceatlas';

  async lookupByImei(_imei: string): Promise<DeviceLookupOutcome> {
    return { ok: false, error: 'not-found' };
  }
}
