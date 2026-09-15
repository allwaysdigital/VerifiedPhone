// Lets specific phone numbers (App Store/Play Store reviewers, QA devices)
// log in with a fixed OTP instead of a real 2Factor SMS — reviewers can't
// receive SMS on the numbers they test with, and this avoids burning 2Factor
// credits on repeated manual QA. Numbers live in the database (OtpBypass
// collection) rather than an env var so they can be managed via the
// /api/admin/otp-bypass endpoints without a redeploy or server restart.

import { OtpBypass } from '../models/OtpBypass';

export const BYPASS_OTP = '123456';

export async function isBypassNumber(e164Phone: string): Promise<boolean> {
  const found = await OtpBypass.findOne({ phoneNumber: e164Phone });
  return !!found;
}
