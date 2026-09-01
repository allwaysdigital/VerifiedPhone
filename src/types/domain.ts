export type DeviceStatus = 'Available' | 'Sold';
export type VerificationStatus = 'Verified' | 'Suspicious';

export type Device = {
  id: string;
  brand: string;
  model: string;
  status: DeviceStatus;
  verification: VerificationStatus;
  color: string;
  condition: string;
  ram: string;
  storage: string;
  batteryHealth: number;
  purchaseDate: string;
  purchaseTime?: string;
  declarationDate?: string;
  saleDate?: string;
  accessories: string[];
  imei1: string;
  imei2?: string;
  purchasePrice: number;
  expectedSalePrice: number;
  profit: number;
  profitPercent: number;
  sellerName: string;
  sellerMobile: string;
  sellerCity: string;
  sellerAltMobile?: string;
  sellerAddress?: string;
  sellerState?: string;
  sellerPincode?: string;
  phoneFrontImageUrl?: string | null;
  phoneBackImageUrl?: string | null;
  oldPhoneBillUrl?: string | null;
  aadhaarFrontUrl?: string | null;
  aadhaarBackUrl?: string | null;
  buyerName?: string;
  buyerMobile?: string;
  buyerAddress?: string;
  buyerAadhaarFrontUrl?: string | null;
  buyerAadhaarBackUrl?: string | null;
  salePrice?: number;
  warrantyPeriod?: string;
};

export type Brand = {
  id: string;
  name: string;
};

export type PlanId = 'monthly' | 'yearly';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

export type Subscription = {
  status: SubscriptionStatus;
  planId: PlanId | null;
  trialEndsAt: string | null;
  expiredOn: string | null;
  paymentMethod: string;
};

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

export type Shop = {
  id: string;
  shopName: string;
  gstNumber: string;
  address: string;
  contactNumber: string;
  logoUrl: string | null;
  phoneNumber?: string;
};

export function formatSubscriptionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getTrialDaysRemaining(sub: Subscription): number {
  if (!sub.trialEndsAt) {
    return 0;
  }
  const diffMs = new Date(sub.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
