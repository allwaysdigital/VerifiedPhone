import { Schema, model, type InferSchemaType, type HydratedDocument } from 'mongoose';

export type PlanId = 'monthly' | 'yearly';
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
      enum: ['monthly', 'yearly', null],
      default: 'monthly',
    },
    trialEndsAt: { type: Date, default: null },
    expiredOn: { type: Date, default: null },
    paymentMethod: { type: String, default: 'UPI (ending 1234)' },
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
    subscription: { type: subscriptionSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export type ShopSchemaType = InferSchemaType<typeof shopSchema>;
export type ShopDocument = HydratedDocument<ShopSchemaType>;

export const Shop = model('Shop', shopSchema);
