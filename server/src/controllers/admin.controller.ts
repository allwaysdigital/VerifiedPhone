import type { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { signAdminToken } from '../auth/adminToken';

function serializeShopForAdmin(shop: InstanceType<typeof Shop>) {
  return {
    id: shop._id.toString(),
    phoneNumber: shop.phoneNumber,
    shopName: shop.shopName,
    gstNumber: shop.gstNumber,
    address: shop.address,
    contactNumber: shop.contactNumber,
    profileCompleted: shop.profileCompleted ?? false,
    otpBypass: shop.otpBypass ?? false,
    subscription: {
      status: shop.subscription?.status ?? 'trial',
      planId: shop.subscription?.planId ?? null,
      trialEndsAt: shop.subscription?.trialEndsAt ?? null,
      expiredOn: shop.subscription?.expiredOn ?? null,
    },
    createdAt: shop.get('createdAt'),
  };
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    res.status(503).json({ error: 'Admin login is not configured on the server.' });
    return;
  }
  if (email !== adminEmail || password !== adminPassword) {
    res.status(401).json({ error: 'Incorrect email or password.' });
    return;
  }

  const token = await signAdminToken();
  res.json({ token });
}

export async function listShops(req: Request, res: Response) {
  const { q } = req.query as { q?: string };
  const filter = q
    ? {
        $or: [
          { phoneNumber: { $regex: q, $options: 'i' } },
          { shopName: { $regex: q, $options: 'i' } },
        ],
      }
    : {};

  const shops = await Shop.find(filter).sort({ createdAt: -1 });
  res.json({ shops: shops.map(serializeShopForAdmin) });
}

export async function updateShop(req: Request, res: Response) {
  const { otpBypass, subscriptionStatus, subscriptionPlanId } = req.body as {
    otpBypass?: boolean;
    subscriptionStatus?: 'none' | 'trial' | 'active' | 'expired';
    subscriptionPlanId?: 'monthly' | 'yearly' | null;
  };

  const update: Record<string, unknown> = {};
  if (typeof otpBypass === 'boolean') {
    update.otpBypass = otpBypass;
  }
  if (subscriptionStatus !== undefined) {
    update['subscription.status'] = subscriptionStatus;
  }
  if (subscriptionPlanId !== undefined) {
    update['subscription.planId'] = subscriptionPlanId;
  }

  const shop = await Shop.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!shop) {
    res.status(404).json({ error: 'Shop not found.' });
    return;
  }
  res.json(serializeShopForAdmin(shop));
}
