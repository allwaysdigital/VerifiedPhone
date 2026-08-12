import crypto from 'crypto';
import path from 'path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const REQUIRED_ENV_VARS = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'S3_BUCKET_NAME'] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`${key} is not set (see .env.example)`);
  }
}

const region = process.env.AWS_REGION as string;
const bucket = process.env.S3_BUCKET_NAME as string;

const s3 = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Uploads a single multer in-memory file to S3 under `<shopId>/<fieldname>/...`
 * and returns the object's public URL. The bucket has a public-read policy,
 * so no signing is needed to view the image later.
 */
export async function uploadFileToS3(
  file: Express.Multer.File,
  shopId: string,
): Promise<string> {
  const ext = path.extname(file.originalname).toLowerCase();
  const key = `${shopId}/${file.fieldname}/${Date.now()}-${crypto.randomUUID()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  );

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}
