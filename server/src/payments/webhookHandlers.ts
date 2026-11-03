import crypto from 'crypto';
import { Shop } from '../models/Shop';
import { planIdFromRazorpayPlan } from './razorpayClient';
import { Payment } from '../models/Payment';

export function verifyWebhookSignature(rawBody: Buffer, signature: string | undefined): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) {
    return false;
  }
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  // Signatures are both hex strings of the same fixed length here, so a
  // length mismatch (which timingSafeEqual would throw on) can only mean
  // the signature is invalid.
  if (expected.length !== signature.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function paymentMethodLabel(method: string | undefined): string | null {
  switch (method) {
    case 'upi':
      return 'UPI AutoPay';
    case 'card':
      return 'Card';
    case 'emandate':
      return 'eMandate (Net Banking)';
    default:
      return method ?? null;
  }
}


type RazorpaySubscriptionEntity = {
  id: string;
  plan_id?: string;
  current_end?: number; // unix seconds
  status?: string;
};

type RazorpayPaymentEntity = {
  id: string;
  amount: number; // paise
  method?: string;
  error_description?: string;
};

type WebhookPayload = {
  event: string;
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity };
    payment?: { entity: RazorpayPaymentEntity };
  };
};

async function findShopBySubscriptionId(razorpaySubscriptionId: string) {
  return Shop.findOne({ 'subscription.razorpaySubscriptionId': razorpaySubscriptionId });
}

export async function handleRazorpayWebhook(body: WebhookPayload): Promise<void> {
  const { event, payload } = body;

  switch (event) {
    case 'subscription.activated': {
      const sub = payload.subscription?.entity;
      if (!sub) return;
      const shop = await findShopBySubscriptionId(sub.id);
      if (!shop) return;
      shop.subscription.status = 'active';
      shop.subscription.planId = planIdFromRazorpayPlan(sub.plan_id);
      shop.subscription.expiredOn = null;
      shop.subscription.renewsOn = sub.current_end ? new Date(sub.current_end * 1000) : null;
      await shop.save();
      break;
    }

    case 'subscription.charged': {
      const sub = payload.subscription?.entity;
      const payment = payload.payment?.entity;
      if (!sub || !payment) return;
      const shop = await findShopBySubscriptionId(sub.id);
      if (!shop) return;

      shop.subscription.status = 'active';
      shop.subscription.expiredOn = null;
      shop.subscription.renewsOn = sub.current_end ? new Date(sub.current_end * 1000) : null;
      shop.subscription.paymentMethod = paymentMethodLabel(payment.method);
      await shop.save();

      await Payment.updateOne(
        { razorpayPaymentId: payment.id },
        {
          $setOnInsert: {
            shopId: shop._id,
            razorpayPaymentId: payment.id,
            razorpaySubscriptionId: sub.id,
            planId: planIdFromRazorpayPlan(sub.plan_id),
            amount: payment.amount / 100,
            status: 'paid',
            method: paymentMethodLabel(payment.method),
            paidAt: new Date(),
          },
        },
        { upsert: true },
      );
      break;
    }

    case 'subscription.cancelled':
    case 'subscription.completed': {
      const sub = payload.subscription?.entity;
      if (!sub) return;
      const shop = await findShopBySubscriptionId(sub.id);
      if (!shop) return;
      shop.subscription.status = 'expired';
      shop.subscription.expiredOn = new Date();
      await shop.save();
      break;
    }

    case 'payment.failed': {
      const payment = payload.payment?.entity;
      if (!payment) return;
      // payment.failed on a subscription charge doesn't always include the
      // subscription entity in the payload — nothing to attribute this to
      // without it, so there's no shop-side state to update.
      const sub = payload.subscription?.entity;
      if (!sub) return;
      const shop = await findShopBySubscriptionId(sub.id);
      if (!shop) return;

      await Payment.updateOne(
        { razorpayPaymentId: payment.id },
        {
          $setOnInsert: {
            shopId: shop._id,
            razorpayPaymentId: payment.id,
            razorpaySubscriptionId: sub.id,
            planId: planIdFromRazorpayPlan(sub.plan_id),
            amount: payment.amount / 100,
            status: 'failed',
            method: paymentMethodLabel(payment.method),
            failureReason: payment.error_description ?? null,
            paidAt: new Date(),
          },
        },
        { upsert: true },
      );
      break;
    }

    default:
      // Unhandled event types are expected (Razorpay sends many more than
      // we act on) — ignoring them is correct, not an error.
      break;
  }
}
