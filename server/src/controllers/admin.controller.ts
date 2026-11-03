import type { Request, Response } from 'express';
import { Shop } from '../models/Shop';
import { Device } from '../models/Device';
import { Brand } from '../models/Brand';
import { Payment } from '../models/Payment';
import { getRazorpayClient } from '../payments/razorpayClient';
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
    subscriptionPlanId?: 'monthly' | 'yearly' | 'weekly_test' | null;
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

function serializeSubscriptionForAdmin(shop: InstanceType<typeof Shop>) {
  return {
    id: shop._id.toString(),
    phoneNumber: shop.phoneNumber,
    shopName: shop.shopName,
    profileCompleted: shop.profileCompleted ?? false,
    subscription: {
      status: shop.subscription?.status ?? 'trial',
      planId: shop.subscription?.planId ?? null,
      trialEndsAt: shop.subscription?.trialEndsAt ?? null,
      expiredOn: shop.subscription?.expiredOn ?? null,
      paymentMethod: shop.subscription?.paymentMethod ?? null,
    },
    createdAt: shop.get('createdAt'),
  };
}

export async function listSubscriptionsAdmin(req: Request, res: Response) {
  const { q, status } = req.query as { q?: string; status?: string };

  const filter: Record<string, unknown> = {};
  if (q) {
    filter.$or = [
      { phoneNumber: { $regex: q, $options: 'i' } },
      { shopName: { $regex: q, $options: 'i' } },
    ];
  }
  if (status) {
    filter['subscription.status'] = status;
  }

  const [shops, summaryAgg] = await Promise.all([
    Shop.find(filter).sort({ createdAt: -1 }),
    Shop.aggregate([
      { $group: { _id: { $ifNull: ['$subscription.status', 'trial'] }, count: { $sum: 1 } } },
    ]),
  ]);

  const summary = { none: 0, trial: 0, active: 0, expired: 0 } as Record<string, number>;
  for (const row of summaryAgg) {
    if (row._id in summary) {
      summary[row._id as string] = row.count;
    }
  }

  res.json({
    shops: shops.map(serializeSubscriptionForAdmin),
    summary,
  });
}

type RazorpayPaymentDetails = {
  id: string;
  amount: number | string;
  currency?: string;
  status?: string;
  method?: string;
  vpa?: string | null;
  bank?: string | null;
  wallet?: string | null;
  email?: string | null;
  contact?: string | number | null;
  fee?: number | null;
  tax?: number | null;
  error_description?: string | null;
  created_at?: number;
  card?: { last4?: string; network?: string } | null;
  acquirer_data?: { rrn?: string; upi_transaction_id?: string; bank_transaction_id?: string } | null;
};

function serializeRazorpayPayment(p: RazorpayPaymentDetails) {
  return {
    status: p.status ?? null,
    method: p.method ?? null,
    vpa: p.vpa ?? null,
    bank: p.bank ?? null,
    wallet: p.wallet ?? null,
    card: p.card?.last4 ? `${p.card.network ?? 'Card'} •••• ${p.card.last4}` : null,
    email: p.email ?? null,
    contact: p.contact ? String(p.contact) : null,
    bankReference: p.acquirer_data?.rrn ?? p.acquirer_data?.bank_transaction_id ?? null,
    upiTransactionId: p.acquirer_data?.upi_transaction_id ?? null,
    fee: typeof p.fee === 'number' ? p.fee / 100 : null,
    tax: typeof p.tax === 'number' ? p.tax / 100 : null,
    errorDescription: p.error_description ?? null,
    createdAt: p.created_at ? new Date(p.created_at * 1000) : null,
  };
}

// Our Payment rows only hold what the webhook/sync recorded; the bank
// reference, UPI ID, fee etc. live in Razorpay, so they're fetched live.
export async function listShopPaymentsAdmin(req: Request, res: Response) {
  const shop = await Shop.findById(req.params.id);
  if (!shop) {
    res.status(404).json({ error: 'Shop not found.' });
    return;
  }

  const rows = await Payment.find({ shopId: shop._id }).sort({ paidAt: -1 }).limit(25);
  const subId = shop.subscription?.razorpaySubscriptionId ?? null;

  let razorpay: ReturnType<typeof getRazorpayClient> | null = null;
  try {
    razorpay = getRazorpayClient();
  } catch {
    razorpay = null;
  }

  let razorpaySubscription: Record<string, unknown> | null = null;
  const paymentIds = new Set(rows.map(r => r.razorpayPaymentId));
  const extraPaymentIds: string[] = [];
  if (razorpay && subId) {
    try {
      const sub = await razorpay.subscriptions.fetch(subId);
      razorpaySubscription = {
        id: sub.id,
        planId: sub.plan_id,
        status: sub.status,
        paidCount: sub.paid_count,
        totalCount: sub.total_count,
        paymentMethod: sub.payment_method ?? null,
        currentEnd: sub.current_end ? new Date(sub.current_end * 1000) : null,
        endAt: sub.end_at ? new Date(sub.end_at * 1000) : null,
      };
      const invoices = await razorpay.invoices.all({ subscription_id: subId } as never);
      for (const inv of invoices.items) {
        if (inv.payment_id && !paymentIds.has(inv.payment_id)) {
          extraPaymentIds.push(inv.payment_id);
        }
      }
    } catch (err) {
      console.error('Admin payments: Razorpay subscription fetch failed', err);
    }
  }

  const baseRows = [
    ...rows.map(r => ({
      razorpayPaymentId: r.razorpayPaymentId,
      razorpaySubscriptionId: r.razorpaySubscriptionId,
      planId: r.planId,
      amount: r.amount,
      currency: r.currency,
      status: r.status,
      method: r.method,
      failureReason: r.failureReason,
      paidAt: r.paidAt,
      recorded: true,
    })),
    ...extraPaymentIds.map(id => ({
      razorpayPaymentId: id,
      razorpaySubscriptionId: subId,
      planId: shop.subscription?.planId ?? null,
      amount: null as number | null,
      currency: 'INR',
      status: null as string | null,
      method: null as string | null,
      failureReason: null as string | null,
      paidAt: null as Date | null,
      recorded: false,
    })),
  ];

  const payments = await Promise.all(
    baseRows.map(async row => {
      let details: ReturnType<typeof serializeRazorpayPayment> | null = null;
      if (razorpay) {
        try {
          const p = (await razorpay.payments.fetch(row.razorpayPaymentId)) as unknown as RazorpayPaymentDetails;
          details = serializeRazorpayPayment(p);
          if (row.amount === null) {
            row.amount = Number(p.amount) / 100;
          }
        } catch (err) {
          console.error('Admin payments: Razorpay payment fetch failed', row.razorpayPaymentId, err);
        }
      }
      return { ...row, paidAt: row.paidAt ?? details?.createdAt ?? null, razorpay: details };
    }),
  );

  res.json({
    shop: { id: shop._id.toString(), shopName: shop.shopName, phoneNumber: shop.phoneNumber },
    subscription: {
      status: shop.subscription?.status ?? 'trial',
      planId: shop.subscription?.planId ?? null,
      renewsOn: shop.subscription?.renewsOn ?? null,
      paymentMethod: shop.subscription?.paymentMethod ?? null,
      razorpaySubscriptionId: subId,
    },
    razorpaySubscription,
    payments,
  });
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
