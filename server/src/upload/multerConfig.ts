import fs from 'fs';
import path from 'path';
import multer from 'multer';
import type { Request } from 'express';

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const shopId = req.shop?._id?.toString() ?? 'unknown';
    const dir = path.join(UPLOADS_ROOT, shopId, file.fieldname);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

export const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

export function fileToUrl(req: Request, file: Express.Multer.File | undefined): string | null {
  if (!file) {
    return null;
  }
  const shopId = req.shop?._id?.toString() ?? 'unknown';
  return `/uploads/${shopId}/${file.fieldname}/${file.filename}`;
}
