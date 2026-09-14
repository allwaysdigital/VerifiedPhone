import type { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { sendOtpViaTwoFactor, verifyOtpViaTwoFactor } from '../auth/twoFactor';
import { signAppToken } from '../auth/appToken';

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

export async function sendOtp(req: Request, res: Response) {
  const { phoneNumber } = req.body as { phoneNumber?: string };
  if (!phoneNumber || !E164_PATTERN.test(phoneNumber)) {
    res.status(400).json({ error: 'Enter a valid phone number.' });
    return;
  }

  try {
    const sessionId = await sendOtpViaTwoFactor(phoneNumber);
    res.json({ sessionId });
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Could not send OTP. Please try again.',
    });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  const { phoneNumber, sessionId, otp } = req.body as {
    phoneNumber?: string;
    sessionId?: string;
    otp?: string;
  };
  if (!phoneNumber || !E164_PATTERN.test(phoneNumber) || !sessionId || !otp) {
    res.status(400).json({ error: 'Missing phone number, session, or OTP.' });
    return;
  }

  let matched: boolean;
  try {
    matched = await verifyOtpViaTwoFactor(sessionId, otp);
  } catch (err) {
    res.status(502).json({
      error: err instanceof Error ? err.message : 'Could not verify OTP. Please try again.',
    });
    return;
  }

  if (!matched) {
    res.status(401).json({ error: 'That OTP is incorrect or has expired.' });
    return;
  }

  // Reuse the existing shop's identity if this phone number has signed in
  // before (including from back when logins went through Firebase) so its
  // stock/purchase/sale history stays attached — only a genuinely new phone
  // number gets a freshly minted id.
  const existingShop = await Shop.findOne({ phoneNumber });
  const uid = existingShop ? existingShop.firebaseUid : `otp:${phoneNumber}`;

  const token = await signAppToken({ uid, phoneNumber });
  res.json({ token });
}
