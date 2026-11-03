import type { Request, Response } from 'express';
import crypto from 'crypto';
import { Shop, type PlanId } from '../models/Shop';
import { Payment } from '../models/Payment';
import { getRazorpayClient, isTestPlanEnabled, razorpayPlanId } from '../payments/razorpayClient';
import { handleRazorpayWebhook, verifyWebhookSignature } from '../payments/webhookHandlers';

const TRIAL_DAYS = 30;

// Razorpay subscriptions bill for a fixed number of cycles — there's no
// "until cancelled" option. Keep the total span at 10 years: a longer end
// date (e.g. 100 years) makes Razorpay hide UPI AutoPay at checkout, since
// UPI mandates can't run that long; only cards/eMandate remain.
const EFFECTIVELY_FOREVER_CYCLES: Record<PlanId, number> = {
  monthly: 120,
  yearly: 10,
  weekly_test: 52,
};

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
    renewsOn: shop.subscription?.renewsOn ?? null,
    paymentMethod: shop.subscription?.paymentMethod ?? null,
    amount: shop.subscription?.amount ?? null,
    testPlanEnabled: isTestPlanEnabled(),
  };
}

const RESYNC_ACTIVE_MS = 10 * 60 * 1000;
const ENDED_STATUSES = new Set(['cancelled', 'completed', 'expired', 'halted']);

// Backstop for a missed or misconfigured webhook: ask Razorpay about one
// subscription and apply the same state changes the webhook would have.
// Returns whether that subscription has actually been paid.
async function applyRazorpaySubscription(
  subId: string,
): Promise<{ status: string; paid: boolean; paidCount: number }> {
  const razorpay = getRazorpayClient();
  const sub = await razorpay.subscriptions.fetch(subId);
  const paidCount = Number(sub.paid_count ?? 0);
  const paid = sub.status === 'active' && paidCount > 0;
  const subEntity = {
    id: sub.id,
    plan_id: sub.plan_id,
    current_end: sub.current_end ?? undefined,
    status: sub.status,
    paid_count: Number(sub.paid_count ?? 0),
  };

  if (sub.status === 'active') {
    await handleRazorpayWebhook({ event: 'subscription.activated', payload: { subscription: { entity: subEntity } } });
    const invoices = await razorpay.invoices.all({ subscription_id: subId } as never);
    const paymentId = invoices.items.find(i => i.status === 'paid')?.payment_id;
    if (paymentId) {
      const payment = await razorpay.payments.fetch(paymentId);
      await handleRazorpayWebhook({
        event: 'subscription.charged',
        payload: {
          subscription: { entity: subEntity },
          payment: { entity: { id: payment.id, amount: Number(payment.amount), method: payment.method } },
        },
      });
    }
  } else if (ENDED_STATUSES.has(sub.status)) {
    // The handler ignores this unless it's the shop's current subscription.
    await handleRazorpayWebhook({ event: 'subscription.cancelled', payload: { subscription: { entity: subEntity } } });
  }
  return { status: sub.status, paid, paidCount };
}

// Pending checkouts are checked on every request; the current subscription
// at most every 10 minutes while active, to catch cancellations made outside
// the app (e.g. the customer revoking the mandate in their UPI app).
async function syncFromRazorpay(shop: InstanceType<typeof Shop>): Promise<void> {
  const pendingId = shop.subscription?.pendingRazorpaySubscriptionId;
  if (pendingId) {
    await applyRazorpaySubscription(pendingId);
  }
  const subId = shop.subscription?.razorpaySubscriptionId;
  if (!subId || subId === pendingId) {
    return;
  }
  const isActive = shop.subscription.status === 'active';
  const lastSynced = shop.subscription.razorpaySyncedAt?.getTime() ?? 0;
  if (isActive && Date.now() - lastSynced < RESYNC_ACTIVE_MS) {
    return;
  }
  const current = await applyRazorpaySubscription(subId);
  if (current.paidCount === 0) {
    await restoreLastPaidSubscription(shop, subId, current.status);
  }
  await Shop.updateOne({ _id: shop._id }, { 'subscription.razorpaySyncedAt': new Date() });
}

// Older checkouts overwrote the shop's current subscription before payment,
// so an abandoned one could replace a paid plan. Point the shop back at the
// subscription its last successful payment belongs to.
async function restoreLastPaidSubscription(
  shop: InstanceType<typeof Shop>,
  unpaidSubId: string,
  unpaidStatus: string,
): Promise<void> {
  const lastPaid = await Payment.findOne({
    shopId: shop._id,
    status: 'paid',
    razorpaySubscriptionId: { $ne: unpaidSubId },
  }).sort({ paidAt: -1 });
  if (!lastPaid) {
    return;
  }
  const stillOpen = unpaidStatus === 'created' || unpaidStatus === 'authenticated';
  await Shop.updateOne(
    { _id: shop._id },
    {
      'subscription.razorpaySubscriptionId': lastPaid.razorpaySubscriptionId,
      'subscription.planId': lastPaid.planId,
      'subscription.pendingRazorpaySubscriptionId': stillOpen ? unpaidSubId : null,
    },
  );
  await applyRazorpaySubscription(lastPaid.razorpaySubscriptionId);
}

// Whether one specific checkout has been paid — what the app polls after
// opening Razorpay, so an already-active shop can't look like a new payment.
export async function getRazorpaySubscriptionStatus(req: Request, res: Response) {
  const { subscriptionId } = req.params;
  const shop = req.shop!;
  if (
    subscriptionId !== shop.subscription?.pendingRazorpaySubscriptionId &&
    subscriptionId !== shop.subscription?.razorpaySubscriptionId
  ) {
    res.status(404).json({ error: 'Subscription not found for this shop.' });
    return;
  }
  const result = await applyRazorpaySubscription(subscriptionId);
  res.json(result);
}

// Brings a shop's subscription up to date with Razorpay and returns the
// fresh document. Used wherever the app loads subscription state.
export async function refreshShopSubscription(
  shop: InstanceType<typeof Shop>,
): Promise<InstanceType<typeof Shop>> {
  try {
    await syncFromRazorpay(shop);
  } catch (err) {
    console.error('Razorpay status sync failed', err);
  }
  const fresh = (await Shop.findById(shop._id)) ?? shop;
  const sub = fresh.subscription;
  // Shops activated before the amount was stored: take it from the last
  // successful payment on their current subscription.
  if (sub?.razorpaySubscriptionId && (sub.amount === null || sub.amount === undefined)) {
    const lastPaid = await Payment.findOne({
      shopId: fresh._id,
      razorpaySubscriptionId: sub.razorpaySubscriptionId,
      status: 'paid',
    }).sort({ paidAt: -1 });
    if (lastPaid) {
      sub.amount = lastPaid.amount;
      await fresh.save();
    }
  }
  // A cancelled subscription keeps access until its paid period ends.
  if (sub?.status === 'active' && !sub.renewsOn && sub.expiredOn && sub.expiredOn.getTime() <= Date.now()) {
    sub.status = 'expired';
    await fresh.save();
  }
  return fresh;
}

export async function getSubscription(req: Request, res: Response) {
  res.json(serializeSubscription(await refreshShopSubscription(req.shop!)));
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
        paymentMethod: req.shop!.subscription?.paymentMethod ?? null,
      },
    },
    { new: true },
  );

  res.json(serializeSubscription(shop!));
}

export async function cancelSubscription(req: Request, res: Response) {
  const existingId = req.shop!.subscription?.razorpaySubscriptionId;
  if (existingId) {
    // Tell Razorpay first — otherwise the UPI AutoPay mandate stays live and
    // keeps charging even though our side thinks the plan is cancelled.
    // cancel_at_cycle_end: false — cancel immediately, matching the "Cancel
    // Subscription" button's wording (no "access until period end" promise
    // made anywhere in the UI).
    await getRazorpayClient().subscriptions.cancel(existingId, false);
  }

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

// Step 1 of checkout: create a Razorpay subscription (and customer, if this
// shop doesn't have one yet) and hand the client just enough to open
// Razorpay's native checkout — the subscription stays in Razorpay's
// "created" state until the customer actually completes the UPI mandate.
export async function createRazorpaySubscription(req: Request, res: Response) {
  const { planId } = req.body as { planId?: PlanId };
  const allowed = planId === 'monthly' || planId === 'yearly' || (planId === 'weekly_test' && isTestPlanEnabled());
  if (!planId || !allowed) {
    res.status(400).json({ error: 'planId must be "monthly" or "yearly"' });
    return;
  }

  const razorpay = getRazorpayClient();
  const shop = req.shop!;

  // No customer_id: binding one makes Razorpay's hosted subscription page
  // return "Hosted page is not available" (and hides UPI in its checkout).
  // The hosted page collects contact details itself.
  const subscription = await razorpay.subscriptions.create({
    plan_id: razorpayPlanId(planId),
    total_count: EFFECTIVELY_FOREVER_CYCLES[planId],
    customer_notify: 1,
  });

  // Only remembered as pending: the shop's plan changes once it's paid.
  shop.subscription.pendingRazorpaySubscriptionId = subscription.id;
  await shop.save();

  res.json({
    subscriptionId: subscription.id,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    shortUrl: subscription.short_url,
  });
}

// Step 2 (optional fast path): the client calls this right after Razorpay
// Checkout's own success callback, purely so the UI can show "activating"
// immediately instead of waiting on the webhook's own latency. The webhook
// (handleRazorpayWebhook, subscription.activated/charged) remains the only
// source of truth for actually flipping status to "active" — this endpoint
// only checks the signature and never writes subscription state itself, so
// a forged or replayed call here can't grant access on its own.
export async function verifyRazorpayPayment(req: Request, res: Response) {
  const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body as {
    razorpay_payment_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature?: string;
  };

  if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
    res.status(400).json({ error: 'Missing payment verification fields.' });
    return;
  }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex');

  if (expected !== razorpay_signature) {
    res.status(400).json({ error: 'Payment signature verification failed.' });
    return;
  }

  res.json({ verified: true });
}

export async function razorpayWebhook(req: Request, res: Response) {
  const signature = req.headers['x-razorpay-signature'] as string | undefined;
  if (!req.rawBody || !verifyWebhookSignature(req.rawBody, signature)) {
    res.status(400).json({ error: 'Invalid webhook signature.' });
    return;
  }

  // Acknowledge immediately — Razorpay retries on anything but a fast 2xx,
  // and our own processing failing shouldn't turn into duplicate retries.
  res.json({ ok: true });

  try {
    await handleRazorpayWebhook(req.body);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Razorpay webhook handling failed:', err);
  }
}

export async function listInvoices(req: Request, res: Response) {
  const payments = await Payment.find({ shopId: req.shop!._id }).sort({ paidAt: -1 }).limit(50);
  res.json({
    invoices: payments.map(p => ({
      id: p.razorpayPaymentId,
      subscriptionId: p.razorpaySubscriptionId,
      planId: p.planId,
      amount: p.amount,
      status: p.status,
      method: p.method,
      failureReason: p.failureReason,
      paidAt: p.paidAt,
    })),
  });
}
