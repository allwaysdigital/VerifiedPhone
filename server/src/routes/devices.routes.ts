import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { resolveShop } from '../middleware/resolveShop';
import { upload } from '../upload/multerConfig';
import { asyncHandler } from '../utils/asyncHandler';
import { createDevice, getDevice, listDevices, markDeviceSold } from '../controllers/devices.controller';

const router = Router();

const purchaseImages = upload.fields([
  { name: 'phoneFrontImage', maxCount: 1 },
  { name: 'phoneBackImage', maxCount: 1 },
  { name: 'oldPhoneBill', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
]);

const saleImages = upload.fields([
  { name: 'buyerAadhaarFront', maxCount: 1 },
  { name: 'buyerAadhaarBack', maxCount: 1 },
]);

router.get('/', requireAuth, asyncHandler(resolveShop), asyncHandler(listDevices));
router.get('/:id', requireAuth, asyncHandler(resolveShop), asyncHandler(getDevice));
router.post(
  '/',
  requireAuth,
  asyncHandler(resolveShop),
  purchaseImages,
  asyncHandler(createDevice),
);
router.patch(
  '/:id',
  requireAuth,
  asyncHandler(resolveShop),
  saleImages,
  asyncHandler(markDeviceSold),
);

export default router;
