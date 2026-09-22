// Lets specific phone numbers (App Store/Play Store reviewers, QA devices)
// log in with a fixed OTP instead of a real 2Factor SMS — reviewers can't
// receive SMS on the numbers they test with, and this avoids burning 2Factor
// credits on repeated manual QA. Driven by the otpBypass flag on that
// phone's Shop document, toggled directly in the database (not through any
// API) since only a Shop that already exists can be flagged this way.

import { Shop } from '../models/Shop';

export const BYPASS_OTP = '123456';

export async function isBypassNumber(e164Phone: string): Promise<boolean> {
  const shop = await Shop.findOne({ phoneNumber: e164Phone, otpBypass: true });
  return !!shop;
}
