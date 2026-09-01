import { request, requestForm, imageFieldToFormFile } from './client';
import { resolveUrl } from './config';
import type { Device, DeviceStatus } from '../types/domain';

type RawDevice = {
  id: string;
  brand: string;
  model: string;
  status: DeviceStatus;
  verification: 'Verified' | 'Suspicious';
  color: string;
  condition: string;
  ram: string;
  storage: string;
  batteryHealth: number | null;
  accessories: string[];
  imei1: string;
  imei2: string | null;
  purchasePrice: number;
  expectedSalePrice: number | null;
  profit: number | null;
  profitPercent: number | null;
  purchasedAt: string;
  sellerName: string;
  sellerMobile: string;
  sellerCity: string;
  sellerAltMobile: string | null;
  sellerAddress: string | null;
  sellerState: string | null;
  sellerPincode: string | null;
  sellerDeclarationConfirmed: boolean;
  sellerDeclarationConfirmedAt: string | null;
  phoneFrontImageUrl: string | null;
  phoneBackImageUrl: string | null;
  oldPhoneBillUrl: string | null;
  aadhaarFrontUrl: string | null;
  aadhaarBackUrl: string | null;
  buyerName: string | null;
  buyerMobile: string | null;
  buyerAddress: string | null;
  buyerAadhaarFrontUrl: string | null;
  buyerAadhaarBackUrl: string | null;
  salePrice: number | null;
  warrantyPeriod: string | null;
  soldAt: string | null;
};

function formatDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function toClientDevice(raw: RawDevice): Device {
  return {
    id: raw.id,
    brand: raw.brand,
    model: raw.model,
    status: raw.status,
    verification: raw.verification,
    color: raw.color,
    condition: raw.condition,
    ram: raw.ram,
    storage: raw.storage,
    batteryHealth: raw.batteryHealth ?? 0,
    purchaseDate: formatDate(raw.purchasedAt),
    purchaseTime: formatTime(raw.purchasedAt),
    declarationDate: raw.sellerDeclarationConfirmedAt
      ? formatDate(raw.sellerDeclarationConfirmedAt)
      : undefined,
    saleDate: raw.soldAt ? formatDate(raw.soldAt) : undefined,
    accessories: raw.accessories,
    imei1: raw.imei1,
    imei2: raw.imei2 ?? undefined,
    purchasePrice: raw.purchasePrice,
    expectedSalePrice: raw.expectedSalePrice ?? 0,
    profit: raw.profit ?? 0,
    profitPercent: raw.profitPercent ?? 0,
    sellerName: raw.sellerName,
    sellerMobile: raw.sellerMobile,
    sellerCity: raw.sellerCity,
    sellerAltMobile: raw.sellerAltMobile ?? undefined,
    sellerAddress: raw.sellerAddress ?? undefined,
    sellerState: raw.sellerState ?? undefined,
    sellerPincode: raw.sellerPincode ?? undefined,
    phoneFrontImageUrl: resolveUrl(raw.phoneFrontImageUrl),
    phoneBackImageUrl: resolveUrl(raw.phoneBackImageUrl),
    oldPhoneBillUrl: resolveUrl(raw.oldPhoneBillUrl),
    aadhaarFrontUrl: resolveUrl(raw.aadhaarFrontUrl),
    aadhaarBackUrl: resolveUrl(raw.aadhaarBackUrl),
    buyerName: raw.buyerName ?? undefined,
    buyerMobile: raw.buyerMobile ?? undefined,
    buyerAddress: raw.buyerAddress ?? undefined,
    buyerAadhaarFrontUrl: resolveUrl(raw.buyerAadhaarFrontUrl),
    buyerAadhaarBackUrl: resolveUrl(raw.buyerAadhaarBackUrl),
    salePrice: raw.salePrice ?? undefined,
    warrantyPeriod: raw.warrantyPeriod ?? undefined,
  };
}

export async function listDevices(status?: DeviceStatus): Promise<Device[]> {
  const query = status ? `?status=${status}` : '';
  const raw = await request<RawDevice[]>(`/api/devices${query}`);
  return raw.map(toClientDevice);
}

export async function getDevice(id: string): Promise<Device> {
  const raw = await request<RawDevice>(`/api/devices/${id}`);
  return toClientDevice(raw);
}

export type DeviceCreateInput = {
  brand: string;
  model: string;
  color: string;
  ram: string;
  storage: string;
  condition: string;
  batteryHealth: string;
  imei1: string;
  imei2: string;
  purchasePrice: string;
  expectedSalePrice: string;
  accessories: string[];
  sellerName: string;
  sellerMobile: string;
  sellerAddress: string;
  sellerCity: string;
  sellerDeclarationConfirmed: boolean;
  phoneFrontImageUri: string | null;
  phoneBackImageUri: string | null;
  oldPhoneBillUri: string | null;
  aadhaarFrontUri: string | null;
  aadhaarBackUri: string | null;
};

export async function createDevice(input: DeviceCreateInput): Promise<Device> {
  const raw = await requestForm<RawDevice>('/api/devices', {
    brand: input.brand,
    model: input.model,
    color: input.color,
    ram: input.ram,
    storage: input.storage,
    condition: input.condition,
    batteryHealth: input.batteryHealth,
    imei1: input.imei1,
    imei2: input.imei2,
    purchasePrice: input.purchasePrice,
    expectedSalePrice: input.expectedSalePrice,
    accessories: input.accessories,
    sellerName: input.sellerName,
    sellerMobile: input.sellerMobile,
    sellerAddress: input.sellerAddress,
    sellerCity: input.sellerCity,
    sellerDeclarationConfirmed: input.sellerDeclarationConfirmed,
    phoneFrontImage: imageFieldToFormFile(input.phoneFrontImageUri),
    phoneBackImage: imageFieldToFormFile(input.phoneBackImageUri),
    oldPhoneBill: imageFieldToFormFile(input.oldPhoneBillUri),
    aadhaarFront: imageFieldToFormFile(input.aadhaarFrontUri),
    aadhaarBack: imageFieldToFormFile(input.aadhaarBackUri),
  });
  return toClientDevice(raw);
}

export type MarkDeviceSoldInput = {
  buyerName: string;
  buyerMobile: string;
  buyerAddress: string;
  buyerAadhaarFrontUri: string | null;
  buyerAadhaarBackUri: string | null;
  salePrice: number;
  warrantyPeriod: string;
};

export async function markDeviceSold(id: string, input: MarkDeviceSoldInput): Promise<Device> {
  const raw = await requestForm<RawDevice>(
    `/api/devices/${id}`,
    {
      buyerName: input.buyerName,
      buyerMobile: input.buyerMobile,
      buyerAddress: input.buyerAddress,
      salePrice: input.salePrice,
      warrantyPeriod: input.warrantyPeriod,
      buyerAadhaarFront: imageFieldToFormFile(input.buyerAadhaarFrontUri),
      buyerAadhaarBack: imageFieldToFormFile(input.buyerAadhaarBackUri),
    },
    { method: 'PATCH' },
  );
  return toClientDevice(raw);
}
