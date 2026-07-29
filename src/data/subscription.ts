export type PlanId = 'monthly' | 'yearly';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

export type PlanDefinition = {
  id: PlanId;
  name: string;
  price: number;
  billingSuffix: string;
  cardDescription: string;
  tagline: string;
  badge?: string;
};

export const PLANS: Record<PlanId, PlanDefinition> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 199,
    billingSuffix: 'Per month',
    cardDescription: 'Flexible monthly subscription',
    tagline: 'flexible monthly billing',
  },
  yearly: {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 1999,
    billingSuffix: 'Per year',
    cardDescription: 'Best value for 12 months',
    tagline: 'long-term savings',
    badge: 'SAVE 17%',
  },
};

export const PLAN_FEATURES = [
  'Unlimited mobile verification',
  'Buy & sell mobile entries',
  'Basic stock management',
  'Generate consent letter (PDF)',
  'Simple sell invoices (PDF)',
  'Basic reports & history',
  'Police verification ready documents (PDF)',
];

export const TRIAL_DAYS = 30;
const DEFAULT_PAYMENT_METHOD = 'UPI (ending 1234)';

export type Subscription = {
  status: SubscriptionStatus;
  planId: PlanId | null;
  trialEndsAt: string | null;
  expiredOn: string | null;
  paymentMethod: string;
};

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

let subscription: Subscription = {
  status: 'trial',
  planId: 'monthly',
  trialEndsAt: addDays(new Date(), TRIAL_DAYS).toISOString(),
  expiredOn: null,
  paymentMethod: DEFAULT_PAYMENT_METHOD,
};

export function getSubscription(): Subscription {
  return subscription;
}

export function startTrial(planId: PlanId): Subscription {
  subscription = {
    status: 'trial',
    planId,
    trialEndsAt: addDays(new Date(), TRIAL_DAYS).toISOString(),
    expiredOn: null,
    paymentMethod: DEFAULT_PAYMENT_METHOD,
  };
  return subscription;
}

export function cancelSubscription(): Subscription {
  subscription = {
    ...subscription,
    status: 'expired',
    expiredOn: formatDisplayDate(new Date()),
  };
  return subscription;
}

export function getTrialDaysRemaining(sub: Subscription): number {
  if (!sub.trialEndsAt) {
    return 0;
  }
  const diffMs = new Date(sub.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function formatSubscriptionDate(isoDate: string): string {
  return formatDisplayDate(new Date(isoDate));
}
