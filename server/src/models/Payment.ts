import { Schema, model } from 'mongoose';

// One row per Razorpay charge attempt (success or failure) against a shop's
// subscription — populated exclusively from webhook events (subscription.
// charged / payment.failed), since that's the only source that's actually
// reliable for recurring UPI AutoPay charges. See payments/webhookHandlers.ts.
const paymentSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    razorpayPaymentId: { type: String, required: true, unique: true },
    razorpaySubscriptionId: { type: String, required: true, index: true },
    planId: { type: String, enum: ['monthly', 'yearly'], required: true },
    amount: { type: Number, required: true }, // in rupees, not paise
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['paid', 'failed'], required: true },
    method: { type: String, default: null }, // e.g. "upi", "card"
    failureReason: { type: String, default: null },
    paidAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Payment = model('Payment', paymentSchema);
