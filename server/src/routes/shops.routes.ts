import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { resolveShop } from '../middleware/resolveShop';
import { upload } from '../upload/multerConfig';
import { asyncHandler } from '../utils/asyncHandler';
import { getMe, register, updateMe } from '../controllers/shops.controller';

const router = Router();

router.post(
  '/register',
  requireAuth,
  asyncHandler(resolveShop),
  upload.single('shopLogo'),
  asyncHandler(register),
);
router.get('/me', requireAuth, asyncHandler(resolveShop), asyncHandler(getMe));
router.patch(
  '/me',
  requireAuth,
  asyncHandler(resolveShop),
  upload.single('shopLogo'),
  asyncHandler(updateMe),
);

export default router;
