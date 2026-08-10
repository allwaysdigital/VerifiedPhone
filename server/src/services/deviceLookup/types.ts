export type DisplaySpecs = {
  size: string | null;
  resolution: string | null;
  type: string | null;
};

export type ProcessorSpecs = {
  chipset: string | null;
  cpu: string | null;
  gpu: string | null;
};

export type CameraSpecs = {
  rear: string | null;
  front: string | null;
};

export type BatterySpecs = {
  capacity: string | null;
};

export type NetworkSpecs = {
  '2G': boolean | null;
  '3G': boolean | null;
  '4G': boolean | null;
  '5G': boolean | null;
};

export type ConnectivitySpecs = {
  simType: string | null;
  simCount: number | null;
  esim: boolean | null;
  wifi: string | null;
  bluetooth: string | null;
  nfc: boolean | null;
  usb: string | null;
};

export type DimensionsSpecs = {
  height: string | null;
  width: string | null;
  thickness: string | null;
};

// Internal, provider-agnostic device schema. Every lookup provider (and the
// local Device Master cache) normalizes into this shape, so the React Native
// app and any future provider swap never need to know which source answered.
// Fields the provider doesn't return are `null` — never guessed or faked.
export type NormalizedDeviceSpecs = {
  imei: string;
  brand: string | null;
  model: string | null;
  modelNumber: string | null;
  deviceType: string | null;
  releaseDate: string | null;
  os: string | null;
  osVersion: string | null;
  ram: string | null;
  storage: string | null;
  color: null; // color is a physical-unit attribute, never sourced from a lookup
  display: DisplaySpecs;
  processor: ProcessorSpecs;
  camera: CameraSpecs;
  battery: BatterySpecs;
  network: NetworkSpecs;
  connectivity: ConnectivitySpecs;
  dimensions: DimensionsSpecs;
  weight: string | null;
  source: 'device-master' | 'imei-info' | 'deviceatlas';
};

export type DeviceLookupErrorType =
  | 'not-found'
  | 'invalid-imei'
  | 'timeout'
  | 'unavailable'
  | 'quota-exceeded'
  | 'auth-error';

export type DeviceLookupOutcome =
  | { ok: true; specs: NormalizedDeviceSpecs }
  | { ok: false; error: DeviceLookupErrorType };

export interface DeviceLookupProvider {
  name: string;
  lookupByImei(imei: string): Promise<DeviceLookupOutcome>;
}

export function emptyNormalizedSpecs(
  imei: string,
  source: NormalizedDeviceSpecs['source'],
): NormalizedDeviceSpecs {
  return {
    imei,
    brand: null,
    model: null,
    modelNumber: null,
    deviceType: null,
    releaseDate: null,
    os: null,
    osVersion: null,
    ram: null,
    storage: null,
    color: null,
    display: { size: null, resolution: null, type: null },
    processor: { chipset: null, cpu: null, gpu: null },
    camera: { rear: null, front: null },
    battery: { capacity: null },
    network: { '2G': null, '3G': null, '4G': null, '5G': null },
    connectivity: {
      simType: null,
      simCount: null,
      esim: null,
      wifi: null,
      bluetooth: null,
      nfc: null,
      usb: null,
    },
    dimensions: { height: null, width: null, thickness: null },
    weight: null,
    source,
  };
}
