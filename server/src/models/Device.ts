import { Schema, model } from 'mongoose';

const deviceSchema = new Schema(
  {
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },

    brand: { type: String, required: true },
    model: { type: String, required: true },
    status: { type: String, enum: ['Available', 'Sold'], default: 'Available', index: true },
    verification: { type: String, enum: ['Verified', 'Suspicious'], default: 'Verified' },
    color: { type: String, default: '' },
    condition: { type: String, required: true },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    batteryHealth: { type: Number, default: null },
    accessories: { type: [String], default: [] },

    // IMEI is no longer mandatory at intake — some used/imported phones
    // don't have it readily available, so the shop can leave it blank and
    // fill it in later.
    imei1: { type: String, default: '' },
    imei2: { type: String, default: null },

    purchasePrice: { type: Number, required: true },
    expectedSalePrice: { type: Number, default: null },
    profit: { type: Number, default: null },
    profitPercent: { type: Number, default: null },
    purchasedAt: { type: Date, default: Date.now },

    sellerName: { type: String, required: true },
    sellerMobile: { type: String, required: true },
    sellerCity: { type: String, default: '' },
    sellerAltMobile: { type: String, default: null },
    sellerAddress: { type: String, default: null },
    sellerState: { type: String, default: null },
    sellerPincode: { type: String, default: null },

    sellerDeclarationConfirmed: { type: Boolean, default: false },
    sellerDeclarationConfirmedAt: { type: Date, default: null },

    phoneFrontImageUrl: { type: String, default: null },
    phoneBackImageUrl: { type: String, default: null },
    oldPhoneBillUrl: { type: String, default: null },
    aadhaarFrontUrl: { type: String, default: null },
    aadhaarBackUrl: { type: String, default: null },

    buyerName: { type: String, default: null },
    buyerMobile: { type: String, default: null },
    buyerAddress: { type: String, default: null },
    buyerPhotoUrl: { type: String, default: null },
    buyerAadhaarFrontUrl: { type: String, default: null },
    buyerAadhaarBackUrl: { type: String, default: null },
    salePrice: { type: Number, default: null },
    warrantyPeriod: { type: String, default: null },
    soldAt: { type: Date, default: null },
  },
  { timestamps: true },
);

deviceSchema.index({ shopId: 1, status: 1 });
deviceSchema.index({ shopId: 1, imei1: 1 });

export const Device = model('Device', deviceSchema);
