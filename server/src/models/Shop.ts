import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type PlanId = 'monthly' | 'yearly' | 'weekly_test';
export type SubscriptionStatus = 'none' | 'trial' | 'active' | 'expired';

const subscriptionSchema = new Schema(
  {
    status: {
      type: String,
      enum: ['none', 'trial', 'active', 'expired'],
      default: 'trial',
    },
    planId: {
      type: String,
      enum: ['monthly', 'yearly', 'weekly_test', null],
      default: 'monthly',
    },
    trialEndsAt: { type: Date, default: null },
    expiredOn: { type: Date, default: null },
    paymentMethod: { type: String, default: null },
    // Set once a Razorpay subscription is created for this shop (see
    // payments/razorpayClient.ts) — the webhook handler looks the shop up
    // by razorpaySubscriptionId for every subsequent lifecycle event.
    razorpaySubscriptionId: { type: String, default: null, index: true },
    // A checkout that hasn't been paid yet. Kept apart from the fields
    // above so an abandoned checkout never changes the shop's current plan;
    // promoted to razorpaySubscriptionId/planId once Razorpay confirms it.
    pendingRazorpaySubscriptionId: { type: String, default: null, index: true },
    razorpayCustomerId: { type: String, default: null },
    renewsOn: { type: Date, default: null },
    // What Razorpay actually charges per cycle (₹), which can differ from
    // the app's list price — e.g. a shop on a discounted or test plan.
    amount: { type: Number, default: null },
    razorpaySyncedAt: { type: Date, default: null },
  },
  { _id: false },
);

const shopSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    phoneNumber: { type: String },
    shopName: { type: String, default: 'My Shop' },
    gstNumber: { type: String, default: '' },
    address: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    logoUrl: { type: String, default: null },
    // False until the dealer actually saves shop details for the first
    // time (via Register, or the post-login Complete Profile screen) —
    // resolveShop's lazy upsert creates a shop with defaults the moment any
    // authenticated call is made, before anyone has entered anything real.
    profileCompleted: { type: Boolean, default: false },
    // Set directly in the database (not exposed through any API) for
    // numbers that should skip 2Factor and log in with the fixed OTP
    // 123456 — app store reviewers, QA devices, etc. See auth/otpBypass.ts.
    otpBypass: { type: Boolean, default: false },
    subscription: { type: subscriptionSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type ShopSchemaType = InferSchemaType<typeof shopSchema>;
export type ShopDocument = HydratedDocument<ShopSchemaType>;

export const Shop = model('Shop', shopSchema);
