import type { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { Device } from '../models/Device';
import { Brand } from '../models/Brand';
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

export async function getOverview(_req: Request, res: Response) {
  const [
    totalShops,
    completedProfiles,
    activeSubs,
    trialSubs,
    totalDevices,
    availableDevices,
    soldDevices,
    totalBrands,
  ] = await Promise.all([
    Shop.countDocuments(),
    Shop.countDocuments({ profileCompleted: true }),
    Shop.countDocuments({ 'subscription.status': 'active' }),
    Shop.countDocuments({ 'subscription.status': 'trial' }),
    Device.countDocuments(),
    Device.countDocuments({ status: 'Available' }),
    Device.countDocuments({ status: 'Sold' }),
    Brand.countDocuments(),
  ]);

  res.json({
    totalShops,
    completedProfiles,
    activeSubs,
    trialSubs,
    totalDevices,
    availableDevices,
    soldDevices,
    totalBrands,
  });
}

export async function listDevicesAdmin(req: Request, res: Response) {
  const { q, status, cursor } = req.query as { q?: string; status?: string; cursor?: string };
  const PAGE_SIZE = 50;

  const filter: Record<string, unknown> = {};
  if (status) {
    filter.status = status;
  }
  if (q) {
    filter.$or = [
      { brand: { $regex: q, $options: 'i' } },
      { model: { $regex: q, $options: 'i' } },
      { imei1: { $regex: q, $options: 'i' } },
      { sellerName: { $regex: q, $options: 'i' } },
      { buyerName: { $regex: q, $options: 'i' } },
    ];
  }
  if (cursor) {
    filter._id = { $lt: cursor };
  }

  const devices = await Device.find(filter).sort({ _id: -1 }).limit(PAGE_SIZE).lean();
  const shopIds = [...new Set(devices.map(d => d.shopId.toString()))];
  const shops = await Shop.find(
    { _id: { $in: shopIds } },
    { shopName: 1, phoneNumber: 1 },
  ).lean();
  const shopById = new Map(shops.map(s => [s._id.toString(), s]));

  const items = devices.map(d => {
    const shop = shopById.get(d.shopId.toString());
    return {
      id: d._id.toString(),
      shopName: shop?.shopName ?? '—',
      shopPhone: shop?.phoneNumber ?? '—',
      brand: d.brand,
      model: d.model,
      status: d.status,
      verification: d.verification,
      imei1: d.imei1,
      purchasePrice: d.purchasePrice,
      salePrice: d.salePrice,
      profit: d.profit,
      sellerName: d.sellerName,
      sellerMobile: d.sellerMobile,
      buyerName: d.buyerName,
      buyerMobile: d.buyerMobile,
      purchasedAt: d.purchasedAt,
      soldAt: d.soldAt,
    };
  });

  res.json({
    devices: items,
    nextCursor: devices.length === PAGE_SIZE ? devices[devices.length - 1]._id.toString() : null,
  });
}

export async function listBrandsAdmin(_req: Request, res: Response) {
  const brands = await Brand.find().sort({ name: 1 });
  res.json({ brands: brands.map(b => ({ id: b._id.toString(), name: b.name })) });
}

export async function addBrandAdmin(req: Request, res: Response) {
  const { name } = req.body as { name?: string };
  const trimmed = name?.trim();
  if (!trimmed) {
    res.status(400).json({ error: 'Brand name is required.' });
    return;
  }

  try {
    const brand = await Brand.create({ name: trimmed, nameLower: trimmed.toLowerCase() });
    res.status(201).json({ id: brand._id.toString(), name: brand.name });
  } catch {
    res.status(409).json({ error: 'That brand already exists.' });
  }
}

export async function deleteBrandAdmin(req: Request, res: Response) {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}
