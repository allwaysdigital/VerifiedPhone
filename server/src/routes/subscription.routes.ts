import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { resolveShop } from '../middleware/resolveShop';
import { asyncHandler } from '../utils/asyncHandler';
import {
  cancelSubscription,
  createRazorpaySubscription,
  getRazorpaySubscriptionStatus,
  getSubscription,
  listInvoices,
  razorpayWebhook,
  startTrial,
  verifyRazorpayPayment,
} from '../controllers/subscription.controller';

const router = Router();

router.get('/', requireAuth, asyncHandler(resolveShop), asyncHandler(getSubscription));
router.post('/start-trial', requireAuth, asyncHandler(resolveShop), asyncHandler(startTrial));
router.post('/cancel', requireAuth, asyncHandler(resolveShop), asyncHandler(cancelSubscription));
router.get('/invoices', requireAuth, asyncHandler(resolveShop), asyncHandler(listInvoices));

router.post(
  '/razorpay/create',
  requireAuth,
  asyncHandler(resolveShop),
  asyncHandler(createRazorpaySubscription),
);
router.post(
  '/razorpay/verify',
  requireAuth,
  asyncHandler(resolveShop),
  asyncHandler(verifyRazorpayPayment),
);
router.get(
  '/razorpay/status/:subscriptionId',
  requireAuth,
  asyncHandler(resolveShop),
  asyncHandler(getRazorpaySubscriptionStatus),
);
// Called by Razorpay's servers directly, not the app — authenticated by
// HMAC signature (see payments/webhookHandlers.ts), not a user session.
router.post('/razorpay/webhook', asyncHandler(razorpayWebhook));

export default router;
