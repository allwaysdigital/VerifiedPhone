import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { resolveShop } from '../middleware/resolveShop';
import { upload } from '../upload/multerConfig';
import { asyncHandler } from '../utils/asyncHandler';
import { createDevice, getDevice, listDevices, markDeviceSold } from '../controllers/devices.controller';
import { lookupDevice } from '../controllers/deviceLookup.controller';

const router = Router();

const purchaseImages = upload.fields([
  { name: 'phoneFrontImage', maxCount: 1 },
  { name: 'phoneBackImage', maxCount: 1 },
  { name: 'oldPhoneBill', maxCount: 1 },
  { name: 'aadhaarFront', maxCount: 1 },
  { name: 'aadhaarBack', maxCount: 1 },
]);

router.get('/', requireAuth, asyncHandler(resolveShop), asyncHandler(listDevices));
// Must be registered before GET /:id — otherwise /:id would swallow
// /lookup/:imei1 since both match at the same path depth.
router.get('/lookup/:imei1', requireAuth, asyncHandler(resolveShop), asyncHandler(lookupDevice));
router.get('/:id', requireAuth, asyncHandler(resolveShop), asyncHandler(getDevice));
router.post(
  '/',
  requireAuth,
  asyncHandler(resolveShop),
  purchaseImages,
  asyncHandler(createDevice),
);
router.patch('/:id', requireAuth, asyncHandler(resolveShop), asyncHandler(markDeviceSold));

export default router;
