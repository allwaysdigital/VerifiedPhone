import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { resolveShop } from '../middleware/resolveShop';
import { asyncHandler } from '../utils/asyncHandler';
import { cancelSubscription, getSubscription, startTrial } from '../controllers/subscription.controller';

const router = Router();

router.get('/', requireAuth, asyncHandler(resolveShop), asyncHandler(getSubscription));
router.post('/start-trial', requireAuth, asyncHandler(resolveShop), asyncHandler(startTrial));
router.post('/cancel', requireAuth, asyncHandler(resolveShop), asyncHandler(cancelSubscription));

export default router;
