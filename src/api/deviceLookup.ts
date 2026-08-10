import { request } from './client';

export type DeviceLookupErrorType =
  | 'invalid-imei'
  | 'timeout'
  | 'unavailable'
  | 'quota-exceeded'
  | 'auth-error';

export type DeviceLookupResponse =
  | { duplicate: true }
  | {
      duplicate: false;
      found: true;
      source: 'device-master' | 'imei-info' | 'deviceatlas';
      device: { brand: string; model: string; ram: string; storage: string };
    }
  | { duplicate: false; found: false; errorType?: DeviceLookupErrorType };

export function lookupDeviceByImei(imei1: string): Promise<DeviceLookupResponse> {
  return request<DeviceLookupResponse>(`/api/devices/lookup/${imei1}`);
}
