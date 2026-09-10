import { request, requestForm, imageFieldToFormFile } from './client';
import { resolveUrl } from './config';
import type { Shop, Subscription } from '../types/domain';

type RawShopResponse = {
  id: string;
  shopName: string;
  gstNumber: string;
  address: string;
  contactNumber: string;
  logoUrl: string | null;
  phoneNumber?: string;
  subscription: Subscription;
};

export type ShopWithSubscription = { shop: Shop; subscription: Subscription };

function toClient(raw: RawShopResponse): ShopWithSubscription {
  return {
    shop: {
      id: raw.id,
      shopName: raw.shopName,
      gstNumber: raw.gstNumber,
      address: raw.address,
      contactNumber: raw.contactNumber,
      logoUrl: resolveUrl(raw.logoUrl),
      phoneNumber: raw.phoneNumber,
    },
    subscription: raw.subscription,
  };
}

export async function getMyShop(): Promise<ShopWithSubscription> {
  const raw = await request<RawShopResponse>('/api/shops/me');
  return toClient(raw);
}

export type ShopDetailsInput = {
  shopName: string;
  gstNumber: string;
  address: string;
  contactNumber: string;
  logoUri?: string | null;
};

export async function registerShop(input: ShopDetailsInput): Promise<ShopWithSubscription> {
  const raw = await requestForm<RawShopResponse>('/api/shops/register', {
    shopName: input.shopName,
    gstNumber: input.gstNumber,
    address: input.address,
    contactNumber: input.contactNumber,
    shopLogo: imageFieldToFormFile(input.logoUri ?? null),
  });
  return toClient(raw);
}

export async function updateShop(input: ShopDetailsInput): Promise<ShopWithSubscription> {
  const raw = await requestForm<RawShopResponse>(
    '/api/shops/me',
    {
      shopName: input.shopName,
      gstNumber: input.gstNumber,
      address: input.address,
      contactNumber: input.contactNumber,
      shopLogo: imageFieldToFormFile(input.logoUri ?? null),
    },
    { method: 'PATCH' },
  );
  return toClient(raw);
}
