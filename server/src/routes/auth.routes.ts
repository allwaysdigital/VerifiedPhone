import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendOtp, verifyOtp } from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', asyncHandler(sendOtp));
router.post('/verify-otp', asyncHandler(verifyOtp));

export default router;
