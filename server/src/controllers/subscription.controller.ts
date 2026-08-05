import type { Request, Response } from 'express';
import { Shop, type PlanId } from '../models/Shop';

const TRIAL_DAYS = 30;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function serializeSubscription(shop: InstanceType<typeof Shop>) {
  return {
    status: shop.subscription?.status ?? 'trial',
    planId: shop.subscription?.planId ?? null,
    trialEndsAt: shop.subscription?.trialEndsAt ?? null,
    expiredOn: shop.subscription?.expiredOn ?? null,
    paymentMethod: shop.subscription?.paymentMethod ?? null,
  };
}

export async function getSubscription(req: Request, res: Response) {
  res.json(serializeSubscription(req.shop!));
}

export async function startTrial(req: Request, res: Response) {
  const { planId } = req.body as { planId: PlanId };
  if (planId !== 'monthly' && planId !== 'yearly') {
    res.status(400).json({ error: 'planId must be "monthly" or "yearly"' });
    return;
  }

  const shop = await Shop.findByIdAndUpdate(
    req.shop!._id,
    {
      subscription: {
        status: 'trial',
        planId,
        trialEndsAt: addDays(new Date(), TRIAL_DAYS),
        expiredOn: null,
        paymentMethod: req.shop!.subscription?.paymentMethod ?? 'UPI (ending 1234)',
      },
    },
    { new: true },
  );

  res.json(serializeSubscription(shop!));
}

export async function cancelSubscription(req: Request, res: Response) {
  const shop = await Shop.findByIdAndUpdate(
    req.shop!._id,
    {
      'subscription.status': 'expired',
      'subscription.expiredOn': new Date(),
    },
    { new: true },
  );

  res.json(serializeSubscription(shop!));
}
