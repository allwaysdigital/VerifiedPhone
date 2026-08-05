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
