import { request } from './client';
import type { PlanId, Subscription } from '../types/domain';

export async function getSubscription(): Promise<Subscription> {
  return request<Subscription>('/api/subscription');
}

export async function startTrial(planId: PlanId): Promise<Subscription> {
  return request<Subscription>('/api/subscription/start-trial', {
    method: 'POST',
    body: { planId },
  });
}

export async function cancelSubscription(): Promise<Subscription> {
  return request<Subscription>('/api/subscription/cancel', { method: 'POST' });
}

export type RazorpayCreateResponse = {
  subscriptionId: string;
  razorpayKeyId: string;
};

export async function createRazorpaySubscription(planId: PlanId): Promise<RazorpayCreateResponse> {
  return request<RazorpayCreateResponse>('/api/subscription/razorpay/create', {
    method: 'POST',
    body: { planId },
  });
}

export type RazorpayVerifyInput = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

export async function verifyRazorpayPayment(input: RazorpayVerifyInput): Promise<{ verified: boolean }> {
  return request<{ verified: boolean }>('/api/subscription/razorpay/verify', {
    method: 'POST',
    body: input,
  });
}

export type Invoice = {
  id: string;
  planId: PlanId;
  amount: number;
  status: 'paid' | 'failed';
  method: string | null;
  failureReason: string | null;
  paidAt: string;
};

export async function listInvoices(): Promise<Invoice[]> {
  const data = await request<{ invoices: Invoice[] }>('/api/subscription/invoices');
  return data.invoices;
}
