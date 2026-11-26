import type { Request, Response } from 'express';
import { Device } from '../models/Device';
import { fileToUrl } from '../upload/multerConfig';
import { nextInvoiceNumber } from '../utils/invoiceNumber';

type ImageFields = {
  phoneFrontImage?: Express.Multer.File[];
  phoneBackImage?: Express.Multer.File[];
  oldPhoneBill?: Express.Multer.File[];
  sellerPhoto?: Express.Multer.File[];
  aadhaarFront?: Express.Multer.File[];
  aadhaarBack?: Express.Multer.File[];
};

type SaleImageFields = {
  buyerPhoto?: Express.Multer.File[];
  buyerAadhaarFront?: Express.Multer.File[];
  buyerAadhaarBack?: Express.Multer.File[];
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
    sellerPhotoUrl: device.sellerPhotoUrl,
    aadhaarFrontUrl: device.aadhaarFrontUrl,
    aadhaarBackUrl: device.aadhaarBackUrl,
    buyerName: device.buyerName,
    buyerMobile: device.buyerMobile,
    buyerAddress: device.buyerAddress,
    buyerPhotoUrl: device.buyerPhotoUrl,
    buyerAadhaarFrontUrl: device.buyerAadhaarFrontUrl,
    buyerAadhaarBackUrl: device.buyerAadhaarBackUrl,
    salePrice: device.salePrice,
    warrantyPeriod: device.warrantyPeriod,
    soldAt: device.soldAt,
    invoiceNumber: device.invoiceNumber,
  };
}

// Sales recorded before invoice numbers were stored get one the first time
// they're loaded, numbered in the order they were sold.
async function ensureInvoiceNumbers(
  shop: NonNullable<Request['shop']>,
  devices: InstanceType<typeof Device>[],
): Promise<void> {
  const missing = devices
    .filter(d => d.status === 'Sold' && !d.invoiceNumber)
    .sort((a, b) => (a.soldAt?.getTime() ?? 0) - (b.soldAt?.getTime() ?? 0));
  for (const device of missing) {
    const assigned = await nextInvoiceNumber(shop._id, shop.shopName, device.soldAt ?? new Date());
    // Only set it if nothing else assigned one in the meantime.
    const updated = await Device.findOneAndUpdate(
      { _id: device._id, invoiceNumber: null },
      { invoiceNumber: assigned },
      { new: true },
    );
    device.invoiceNumber = updated?.invoiceNumber ?? (await Device.findById(device._id))?.invoiceNumber ?? null;
  }
}

export async function listDevices(req: Request, res: Response) {
  const { status } = req.query as { status?: string };
  const filter: Record<string, unknown> = { shopId: req.shop!._id };
  if (status === 'Available' || status === 'Sold') {
    filter.status = status;
  }
  const devices = await Device.find(filter).sort({ createdAt: -1 });
  await ensureInvoiceNumbers(req.shop!, devices);
  res.json(devices.map(serializeDevice));
}

export async function getDevice(req: Request, res: Response) {
  const device = await Device.findOne({ _id: req.params.id, shopId: req.shop!._id });
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }
  await ensureInvoiceNumbers(req.shop!, [device]);
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

  // Upload whichever of the 5 images were attached to S3 in parallel, then
  // create the device once with real URLs already in hand.
  const [
    phoneFrontImageUrl,
    phoneBackImageUrl,
    oldPhoneBillUrl,
    sellerPhotoUrl,
    aadhaarFrontUrl,
    aadhaarBackUrl,
  ] = await Promise.all([
    fileToUrl(req, files.phoneFrontImage?.[0]),
    fileToUrl(req, files.phoneBackImage?.[0]),
    fileToUrl(req, files.oldPhoneBill?.[0]),
    fileToUrl(req, files.sellerPhoto?.[0]),
    fileToUrl(req, files.aadhaarFront?.[0]),
    fileToUrl(req, files.aadhaarBack?.[0]),
  ]);

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
    phoneFrontImageUrl,
    phoneBackImageUrl,
    oldPhoneBillUrl,
    sellerPhotoUrl,
    aadhaarFrontUrl,
    aadhaarBackUrl,
  });

  res.status(201).json(serializeDevice(device));
}

// Edits a purchase (VP-17). Only photos that were re-picked are sent and
// replaced; the rest keep their stored URLs. The seller's declaration and the
// sale itself are left as they were; profit is recalculated against the real
// sale price once sold, otherwise against the expected sale price.
export async function updateDevice(req: Request, res: Response) {
  const device = await Device.findOne({ _id: req.params.id, shopId: req.shop!._id });
  if (!device) {
    res.status(404).json({ error: 'Device not found' });
    return;
  }

  const body = req.body as Record<string, string | undefined>;
  const files = (req.files ?? {}) as ImageFields;

  const [
    phoneFrontImageUrl,
    phoneBackImageUrl,
    oldPhoneBillUrl,
    sellerPhotoUrl,
    aadhaarFrontUrl,
    aadhaarBackUrl,
  ] = await Promise.all([
    fileToUrl(req, files.phoneFrontImage?.[0]),
    fileToUrl(req, files.phoneBackImage?.[0]),
    fileToUrl(req, files.oldPhoneBill?.[0]),
    fileToUrl(req, files.sellerPhoto?.[0]),
    fileToUrl(req, files.aadhaarFront?.[0]),
    fileToUrl(req, files.aadhaarBack?.[0]),
  ]);

  if (body.brand !== undefined) device.brand = body.brand;
  if (body.model !== undefined) device.set('model', body.model);
  if (body.color !== undefined) device.color = body.color;
  if (body.condition !== undefined) device.condition = body.condition;
  if (body.ram !== undefined) device.ram = body.ram;
  if (body.storage !== undefined) device.storage = body.storage;
  if (body.batteryHealth !== undefined) {
    device.batteryHealth = body.batteryHealth ? Number(body.batteryHealth) : null;
  }
  if (body.accessories !== undefined) {
    try {
      device.accessories = JSON.parse(body.accessories);
    } catch {
      // keep the existing list on malformed input
    }
  }
  if (body.imei1 !== undefined) device.imei1 = body.imei1;
  if (body.imei2 !== undefined) device.imei2 = body.imei2 || null;
  if (body.purchasePrice !== undefined) device.purchasePrice = Number(body.purchasePrice) || 0;
  if (body.expectedSalePrice !== undefined) {
    device.expectedSalePrice = body.expectedSalePrice ? Number(body.expectedSalePrice) : null;
  }
  if (body.sellerName !== undefined) device.sellerName = body.sellerName;
  if (body.sellerMobile !== undefined) device.sellerMobile = body.sellerMobile;
  if (body.sellerCity !== undefined) device.sellerCity = body.sellerCity;
  if (body.sellerAddress !== undefined) device.sellerAddress = body.sellerAddress || null;

  if (phoneFrontImageUrl) device.phoneFrontImageUrl = phoneFrontImageUrl;
  if (phoneBackImageUrl) device.phoneBackImageUrl = phoneBackImageUrl;
  if (oldPhoneBillUrl) device.oldPhoneBillUrl = oldPhoneBillUrl;
  if (sellerPhotoUrl) device.sellerPhotoUrl = sellerPhotoUrl;
  if (aadhaarFrontUrl) device.aadhaarFrontUrl = aadhaarFrontUrl;
  if (aadhaarBackUrl) device.aadhaarBackUrl = aadhaarBackUrl;

  // Optional photos the dealer removed while editing. Required ones (phone
  // front, Aadhaar) can only be replaced, never cleared.
  let removeImages: string[] = [];
  try {
    removeImages = body.removeImages ? JSON.parse(body.removeImages) : [];
  } catch {
    removeImages = [];
  }
  if (removeImages.includes('phoneBackImage') && !phoneBackImageUrl) device.phoneBackImageUrl = null;
  if (removeImages.includes('oldPhoneBill') && !oldPhoneBillUrl) device.oldPhoneBillUrl = null;
  if (removeImages.includes('sellerPhoto') && !sellerPhotoUrl) device.sellerPhotoUrl = null;

  const target = device.status === 'Sold' ? device.salePrice : device.expectedSalePrice;
  if (target !== null && target !== undefined) {
    device.profit = target - device.purchasePrice;
    device.profitPercent =
      device.purchasePrice > 0
        ? Number(((device.profit / device.purchasePrice) * 100).toFixed(2))
        : null;
  } else {
    device.profit = null;
    device.profitPercent = null;
  }

  await device.save();
  res.json(serializeDevice(device));
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
    salePrice: string | number;
    warrantyPeriod?: string;
  };
  const files = (req.files ?? {}) as SaleImageFields;

  const [buyerPhotoUrl, buyerAadhaarFrontUrl, buyerAadhaarBackUrl] = await Promise.all([
    fileToUrl(req, files.buyerPhoto?.[0]),
    fileToUrl(req, files.buyerAadhaarFront?.[0]),
    fileToUrl(req, files.buyerAadhaarBack?.[0]),
  ]);

  const numericSalePrice = Number(salePrice) || 0;
  const profit = numericSalePrice - device.purchasePrice;
  const profitPercent =
    device.purchasePrice > 0 ? Number(((profit / device.purchasePrice) * 100).toFixed(2)) : null;

  device.status = 'Sold';
  device.buyerName = buyerName;
  device.buyerMobile = buyerMobile;
  device.buyerAddress = buyerAddress ?? null;
  // Only overwrite a document URL when a new file actually came in for this
  // sale — keeps a re-save (if that's ever wired up) from wiping a
  // previously uploaded Aadhaar image.
  if (buyerPhotoUrl) {
    device.buyerPhotoUrl = buyerPhotoUrl;
  }
  if (buyerAadhaarFrontUrl) {
    device.buyerAadhaarFrontUrl = buyerAadhaarFrontUrl;
  }
  if (buyerAadhaarBackUrl) {
    device.buyerAadhaarBackUrl = buyerAadhaarBackUrl;
  }
  device.salePrice = numericSalePrice;
  device.warrantyPeriod = warrantyPeriod ?? null;
  device.profit = profit;
  device.profitPercent = profitPercent;
  device.soldAt = new Date();
  device.invoiceNumber = await nextInvoiceNumber(req.shop!._id, req.shop!.shopName, device.soldAt);
  await device.save();

  res.json(serializeDevice(device));
}
