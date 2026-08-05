import { Schema, model } from 'mongoose';

// Brands are a single global catalog shared by every shop (phone brand names
// aren't shop-specific data), not scoped per-shop.
const brandSchema = new Schema(
  {
    name: { type: String, required: true },
    nameLower: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const DEFAULT_BRAND_NAMES = [
  'Apple',
  'Samsung',
  'OnePlus',
  'Xiaomi',
  'Others',
  'VIVO',
  'Oppo',
  'Google',
];

export const Brand = model('Brand', brandSchema);

export async function seedDefaultBrandsIfEmpty(): Promise<void> {
  const count = await Brand.countDocuments();
  if (count > 0) {
    return;
  }
  await Brand.insertMany(
    DEFAULT_BRAND_NAMES.map(name => ({ name, nameLower: name.toLowerCase() })),
  );
}
