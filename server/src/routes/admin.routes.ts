import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAdminAuth } from '../middleware/requireAdminAuth';
import { listShops, login, updateShop } from '../controllers/admin.controller';

const router = Router();

router.post('/login', asyncHandler(login));
router.get('/shops', requireAdminAuth, asyncHandler(listShops));
router.patch('/shops/:id', requireAdminAuth, asyncHandler(updateShop));

export default router;
