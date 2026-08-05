import type { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { fileToUrl } from '../upload/multerConfig';

function serializeShop(shop: InstanceType<typeof Shop>) {
  return {
    id: shop._id.toString(),
    shopName: shop.shopName,
    gstNumber: shop.gstNumber,
    address: shop.address,
    contactNumber: shop.contactNumber,
    logoUrl: shop.logoUrl,
    phoneNumber: shop.phoneNumber,
    subscription: {
      status: shop.subscription?.status ?? 'trial',
      planId: shop.subscription?.planId ?? null,
      trialEndsAt: shop.subscription?.trialEndsAt ?? null,
      expiredOn: shop.subscription?.expiredOn ?? null,
      paymentMethod: shop.subscription?.paymentMethod ?? null,
    },
  };
}

export async function getMe(req: Request, res: Response) {
  res.json(serializeShop(req.shop!));
}

export async function register(req: Request, res: Response) {
  const { shopName, gstNumber, address, contactNumber } = req.body as Record<string, string>;
  const logoUrl = fileToUrl(req, req.file);

  const update: Record<string, unknown> = {
    shopName,
    gstNumber,
    address,
    contactNumber,
  };
  if (logoUrl) {
    update.logoUrl = logoUrl;
  }

  const shop = await Shop.findOneAndUpdate({ firebaseUid: req.uid }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  res.status(201).json(serializeShop(shop));
}

export async function updateMe(req: Request, res: Response) {
  const { shopName, gstNumber, address, contactNumber } = req.body as Record<string, string>;
  const logoUrl = fileToUrl(req, req.file);

  const update: Record<string, unknown> = {};
  if (shopName !== undefined) update.shopName = shopName;
  if (gstNumber !== undefined) update.gstNumber = gstNumber;
  if (address !== undefined) update.address = address;
  if (contactNumber !== undefined) update.contactNumber = contactNumber;
  if (logoUrl) update.logoUrl = logoUrl;

  const shop = await Shop.findByIdAndUpdate(req.shop!._id, update, { new: true });
  res.json(serializeShop(shop!));
}
