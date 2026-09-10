import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { createBrand, listBrands } from '../controllers/brands.controller';

const router = Router();

router.get('/', requireAuth, asyncHandler(listBrands));
router.post('/', requireAuth, asyncHandler(createBrand));

export default router;
