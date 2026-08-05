import type { Request, Response } from 'express';
import { Device } from '../models/Device';
import { fileToUrl } from '../upload/multerConfig';

type ImageFields = {
  phoneFrontImage?: Express.Multer.File[];
  phoneBackImage?: Express.Multer.File[];
  oldPhoneBill?: Express.Multer.File[];
  aadhaarFront?: Express.Multer.File[];
  aadhaarBack?: Express.Multer.File[];
};

function serializeDevice(device: InstanceType<typeof Device>) {
  return {
    id: device._id.toString(),
    brand: device.brand,
    model: device.model,
    status: device.status,
    verification: device.verification,
    color: device.color,
    condition: device.condition,
    ram: device.ram,
    storage: device.storage,
    batteryHealth: device.batteryHealth,
    accessories: device.accessories,
    imei1: device.imei1,
    imei2: device.imei2,
    purchasePrice: device.purchasePrice,
    expectedSalePrice: device.expectedSalePrice,
    profit: device.profit,
    profitPercent: device.profitPercent,
    purchasedAt: device.purchasedAt,
    sellerName: device.sellerName,
    sellerMobile: device.sellerMobile,
    sellerCity: device.sellerCity,
    sellerAltMobile: device.sellerAltMobile,
    sellerAddress: device.sellerAddress,
    sellerState: device.sellerState,
    sellerPincode: device.sellerPincode,
    sellerDeclarationConfirmed: device.sellerDeclarationConfirmed,
    sellerDeclarationConfirmedAt: device.sellerDeclarationConfirmedAt,
    phoneFrontImageUrl: device.phoneFrontImageUrl,
    phoneBackImageUrl: device.phoneBackImageUrl,
    oldPhoneBillUrl: device.oldPhoneBillUrl,
    aadhaarFrontUrl: device.aadhaarFrontUrl,
    aadhaarBackUrl: device.aadhaarBackUrl,
    buyerName: device.buyerName,
    buyerMobile: device.buyerMobile,
    buyerAddress: device.buyerAddress,
    salePrice: device.salePrice,
    warrantyPeriod: device.warrantyPeriod,
    soldAt: device.soldAt,
  };
}

export async function listDevices(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  const filter: Record<string, unknown> = { shopId: req.shop!._id };
  if (status === 'Available' || status === 'Sold') {
    filter.status = status;
  }
  const devices = await Device.find(filter).sort({ createdAt: -1 });
  res.json(devices.map(serializeDevice));
}

export async function getDevice(req: Request, res: Response) {
  const device = await Device.findOne({ _id: req.params.id, shopId: req.shop!._id });
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }
  res.json(serializeDevice(device));
}

export async function createDevice(req: Request, res: Response) {
  const body = req.body as Record<string, string>;
  const files = (req.files ?? {}) as ImageFields;

  const purchasePrice = Number(body.purchasePrice) || 0;
  const expectedSalePrice = body.expectedSalePrice ? Number(body.expectedSalePrice) : null;
  const profit = expectedSalePrice !== null ? expectedSalePrice - purchasePrice : null;
  const profitPercent =
    profit !== null && purchasePrice > 0 ? Number(((profit / purchasePrice) * 100).toFixed(2)) : null;

  let accessories: string[] = [];
  if (body.accessories) {
    try {
      accessories = JSON.parse(body.accessories);
    } catch {
      accessories = [];
    }
  }

  const device = await Device.create({
    shopId: req.shop!._id,
    brand: body.brand,
    model: body.model,
    color: body.color,
    condition: body.condition,
    ram: body.ram,
    storage: body.storage,
    batteryHealth: body.batteryHealth ? Number(body.batteryHealth) : null,
    accessories,
    imei1: body.imei1,
    imei2: body.imei2 || null,
    purchasePrice,
    expectedSalePrice,
    profit,
    profitPercent,
    sellerName: body.sellerName,
    sellerMobile: body.sellerMobile,
    sellerCity: body.sellerCity,
    sellerAddress: body.sellerAddress || null,
    sellerDeclarationConfirmed: body.sellerDeclarationConfirmed === 'true',
    sellerDeclarationConfirmedAt: body.sellerDeclarationConfirmed === 'true' ? new Date() : null,
    phoneFrontImageUrl: fileToUrl(req, files.phoneFrontImage?.[0]),
    phoneBackImageUrl: fileToUrl(req, files.phoneBackImage?.[0]),
    oldPhoneBillUrl: fileToUrl(req, files.oldPhoneBill?.[0]),
    aadhaarFrontUrl: fileToUrl(req, files.aadhaarFront?.[0]),
    aadhaarBackUrl: fileToUrl(req, files.aadhaarBack?.[0]),
  });

  res.status(201).json(serializeDevice(device));
}

export async function markDeviceSold(req: Request, res: Response) {
  const device = await Device.findOne({ _id: req.params.id, shopId: req.shop!._id });
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }
  if (device.status === 'Sold') {
    res.status(409).json({ error: 'Device is already sold' });
    return;
  }

  const { buyerName, buyerMobile, buyerAddress, salePrice, warrantyPeriod } = req.body as {
    buyerName: string;
    buyerMobile: string;
    buyerAddress?: string;
    salePrice: number;
    warrantyPeriod?: string;
  };

  const numericSalePrice = Number(salePrice) || 0;
  const profit = numericSalePrice - device.purchasePrice;
  const profitPercent =
    device.purchasePrice > 0 ? Number(((profit / device.purchasePrice) * 100).toFixed(2)) : null;

  device.status = 'Sold';
  device.buyerName = buyerName;
  device.buyerMobile = buyerMobile;
  device.buyerAddress = buyerAddress ?? null;
  device.salePrice = numericSalePrice;
  device.warrantyPeriod = warrantyPeriod ?? null;
  device.profit = profit;
  device.profitPercent = profitPercent;
  device.soldAt = new Date();
  await device.save();

  res.json(serializeDevice(device));
}
