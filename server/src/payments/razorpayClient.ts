import Razorpay from 'razorpay';
import type { PlanId } from '../models/Shop';

const REQUIRED_ENV_VARS = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_PLAN_MONTHLY',
  'RAZORPAY_PLAN_YEARLY',
] as const;

export function requireRazorpayEnv(): void {
  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      throw new Error(`${key} is not set (see .env.example)`);
    }
  }
}

let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  requireRazorpayEnv();
  if (!client) {
    client = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }
  return client;
}

// Razorpay Plans are created once via the Dashboard (or API, one-off) and
// referenced here by ID — mirrors how the 2Factor OTP template works
// (see auth/twoFactor.ts): the provider-side object is set up out of band,
// we just hold the ID that points at it.
export function razorpayPlanId(planId: PlanId): string {
  const key = planId === 'yearly' ? 'RAZORPAY_PLAN_YEARLY' : 'RAZORPAY_PLAN_MONTHLY';
  const id = process.env[key];
  if (!id) {
    throw new Error(`${key} is not set (see .env.example)`);
  }
  return id;
}
