import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAdminSecret } from '../middleware/requireAdminSecret';
import {
  addBypassNumber,
  listBypassNumbers,
  removeBypassNumber,
} from '../controllers/otpBypass.controller';

const router = Router();

router.use(requireAdminSecret);
router.get('/', asyncHandler(listBypassNumbers));
router.post('/', asyncHandler(addBypassNumber));
router.delete('/:phoneNumber', asyncHandler(removeBypassNumber));

export default router;
