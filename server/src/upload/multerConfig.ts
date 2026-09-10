import multer from 'multer';
import type { Request } from 'express';
import { uploadFileToS3 } from './s3Client';

// Files are held in memory just long enough to stream to S3 — nothing is
// written to local disk, since the app server's filesystem is ephemeral
// (wiped on every deploy/restart on Render).
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export async function fileToUrl(req: Request, file: Express.Multer.File | undefined): Promise<string | null> {
  if (!file) {
    return null;
  }
  const shopId = req.shop?._id?.toString() ?? 'unknown';
  return uploadFileToS3(file, shopId);
}
