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
const PLAN_ENV_KEYS: Record<PlanId, string> = {
  monthly: 'RAZORPAY_PLAN_MONTHLY',
  yearly: 'RAZORPAY_PLAN_YEARLY',
  weekly_test: 'RAZORPAY_PLAN_TEST',
};

// The ₹1 weekly test plan is offered only while RAZORPAY_PLAN_TEST is set,
// so removing that env var on Render hides it from every shop.
export function isTestPlanEnabled(): boolean {
  return Boolean(process.env.RAZORPAY_PLAN_TEST);
}

export function planIdFromRazorpayPlan(razorpayPlanId: string | undefined): PlanId {
  const match = (Object.keys(PLAN_ENV_KEYS) as PlanId[]).find(
    id => razorpayPlanId && process.env[PLAN_ENV_KEYS[id]] === razorpayPlanId,
  );
  return match ?? 'monthly';
}

export function razorpayPlanId(planId: PlanId): string {
  const key = PLAN_ENV_KEYS[planId];
  const id = process.env[key];
  if (!id) {
    throw new Error(`${key} is not set (see .env.example)`);
  }
  return id;
}
