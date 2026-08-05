import type { Request, Response } from 'express';
import { Brand } from '../models/Brand';

function serializeBrand(brand: InstanceType<typeof Brand>) {
  return { id: brand._id.toString(), name: brand.name };
}

export async function listBrands(_req: Request, res: Response) {
  const brands = await Brand.find().sort({ name: 1 });
  res.json(brands.map(serializeBrand));
}

export async function createBrand(req: Request, res: Response) {
  const { name } = req.body as { name?: string };
  const trimmed = name?.trim();
  if (!trimmed) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const nameLower = trimmed.toLowerCase();
  const existing = await Brand.findOne({ nameLower });
  if (existing) {
    res.status(409).json({ error: 'Brand already exists' });
    return;
  }

  const brand = await Brand.create({ name: trimmed, nameLower });
  res.status(201).json(serializeBrand(brand));
}
