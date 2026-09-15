import type { Request, Response } from 'express';
import { OtpBypass } from '../models/OtpBypass';

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export async function listBypassNumbers(_req: Request, res: Response) {
  const entries = await OtpBypass.find().sort({ createdAt: -1 });
  res.json({ phoneNumbers: entries.map(e => e.phoneNumber) });
}

export async function addBypassNumber(req: Request, res: Response) {
  const { phoneNumber } = req.body as { phoneNumber?: string };
  if (!phoneNumber || !E164_PATTERN.test(phoneNumber)) {
    res.status(400).json({ error: 'Enter a valid phone number in E.164 format (e.g. +919876543210).' });
    return;
  }
  await OtpBypass.updateOne({ phoneNumber }, { phoneNumber }, { upsert: true });
  res.json({ ok: true });
}

export async function removeBypassNumber(req: Request, res: Response) {
  const { phoneNumber } = req.params as { phoneNumber: string };
  await OtpBypass.deleteOne({ phoneNumber });
  res.json({ ok: true });
}
