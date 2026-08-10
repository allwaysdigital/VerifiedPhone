import type { Request, Response } from 'express';
import { isValidImeiChecksum } from '../services/deviceLookup/luhn';
import { lookupDeviceSpecs } from '../services/deviceLookup';
import type { DeviceLookupErrorType } from '../services/deviceLookup/types';

const IMEI_FORMAT = /^\d{15}$/;

const ERROR_STATUS: Record<DeviceLookupErrorType, number> = {
  'not-found': 404,
  'invalid-imei': 400,
  timeout: 504,
  unavailable: 503,
  'quota-exceeded': 429,
  'auth-error': 502,
};

const ERROR_MESSAGE: Record<DeviceLookupErrorType, string> = {
  'not-found': 'Device not found for this IMEI',
  'invalid-imei': 'IMEI failed checksum validation',
  timeout: 'Device lookup timed out',
  unavailable: 'Device lookup service is unavailable',
  'quota-exceeded': 'Device lookup quota exceeded',
  'auth-error': 'Device lookup provider rejected our credentials',
};

// Standalone, full-specification IMEI lookup. Independent of any specific
// shop's inventory (no duplicate-purchase check here — see
// deviceLookup.controller.ts for the shop-scoped Add Purchase flow, which
// shares this same cache-then-provider orchestration).
export async function lookupDeviceByImei(req: Request, res: Response) {
  const { imei } = req.body as { imei?: unknown };

  if (typeof imei !== 'string' || !IMEI_FORMAT.test(imei)) {
    res.status(400).json({ error: 'invalid-imei', message: 'imei must be exactly 15 digits' });
    return;
  }
  if (!isValidImeiChecksum(imei)) {
    res.status(400).json({ error: 'invalid-imei', message: ERROR_MESSAGE['invalid-imei'] });
    return;
  }

  const outcome = await lookupDeviceSpecs(imei);
  if (outcome.ok) {
    res.json(outcome.specs);
    return;
  }

  res.status(ERROR_STATUS[outcome.error]).json({
    error: outcome.error,
    message: ERROR_MESSAGE[outcome.error],
  });
}
