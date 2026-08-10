import type { Request, Response } from 'express';
import { Device } from '../models/Device';
import { lookupDeviceSpecs } from '../services/deviceLookup';

const IMEI_PATTERN = /^\d{15}$/;

// Shop-scoped Add Purchase lookup: duplicate-check first (shop-specific),
// then the shared cache-then-provider orchestration (global, shared across
// shops). Response shape stays backward compatible with what the RN app
// already reads (device: {brand,model,ram,storage}) — `specs` is additive,
// carrying the full normalized schema for future phases without requiring
// another backend change when the UI grows to use more of it.
export async function lookupDevice(req: Request, res: Response) {
  const { imei1 } = req.params;

  if (!IMEI_PATTERN.test(imei1)) {
    res.status(400).json({ error: 'imei1 must be exactly 15 digits' });
    return;
  }

  const existing = await Device.findOne({ shopId: req.shop!._id, imei1 });
  if (existing) {
    res.json({ duplicate: true });
    return;
  }

  const outcome = await lookupDeviceSpecs(imei1);
  if (!outcome.ok) {
    const errorType = outcome.error === 'not-found' ? undefined : outcome.error;
    res.json({ duplicate: false, found: false, errorType });
    return;
  }

  const { specs } = outcome;
  res.json({
    duplicate: false,
    found: true,
    source: specs.source,
    device: {
      brand: specs.brand ?? '',
      model: specs.model ?? '',
      ram: specs.ram ?? '',
      storage: specs.storage ?? '',
    },
    specs,
  });
}
