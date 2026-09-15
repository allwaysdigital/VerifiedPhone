import { Schema, model, type InferSchemaType } from 'mongoose';

const otpBypassSchema = new Schema(
  {
    phoneNumber: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true },
);

export type OtpBypassSchemaType = InferSchemaType<typeof otpBypassSchema>;

export const OtpBypass = model('OtpBypass', otpBypassSchema);
