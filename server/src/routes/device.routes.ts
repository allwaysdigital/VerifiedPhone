import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { lookupDeviceByImei } from '../controllers/device.controller';

const router = Router();

// Global device-spec lookup, not shop-scoped — any authenticated shop can
// call it. Gated behind requireAuth only (no resolveShop) since it neither
// reads nor writes shop-specific data, and to keep an unauthenticated caller
// from running up billed lookups against the configured provider.
router.post('/lookup', requireAuth, asyncHandler(lookupDeviceByImei));

export default router;
