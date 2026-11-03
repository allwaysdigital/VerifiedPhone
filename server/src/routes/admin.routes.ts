import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAdminAuth } from '../middleware/requireAdminAuth';
import {
  addBrandAdmin,
  deleteBrandAdmin,
  getOverview,
  listBrandsAdmin,
  listDevicesAdmin,
  listShopPaymentsAdmin,
  listShops,
  listSubscriptionsAdmin,
  login,
  updateShop,
} from '../controllers/admin.controller';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/overview', requireAdminAuth, asyncHandler(getOverview));
router.get('/shops', requireAdminAuth, asyncHandler(listShops));
router.patch('/shops/:id', requireAdminAuth, asyncHandler(updateShop));
router.get('/shops/:id/payments', requireAdminAuth, asyncHandler(listShopPaymentsAdmin));
router.get('/subscriptions', requireAdminAuth, asyncHandler(listSubscriptionsAdmin));
router.get('/devices', requireAdminAuth, asyncHandler(listDevicesAdmin));
router.get('/brands', requireAdminAuth, asyncHandler(listBrandsAdmin));
router.post('/brands', requireAdminAuth, asyncHandler(addBrandAdmin));
router.delete('/brands/:id', requireAdminAuth, asyncHandler(deleteBrandAdmin));

export default router;
