import path from 'path';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import shopsRoutes from './routes/shops.routes';
import devicesRoutes from './routes/devices.routes';
import brandsRoutes from './routes/brands.routes';
import subscriptionRoutes from './routes/subscription.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  // Uploaded images (device photos, shop logos) are stored in S3 and served
  // directly from there — see server/src/upload/s3Client.ts. Nothing is
  // written to local disk, since the app server's filesystem is ephemeral.

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authRoutes);
  app.use('/api/shops', shopsRoutes);
  app.use('/api/devices', devicesRoutes);
  app.use('/api/brands', brandsRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/admin', adminRoutes);

  // A plain static page (no build step) — see server/public/admin. Sits
  // beside dist/ in production and src/ in dev, so this path resolves the
  // same either way.
  app.use('/admin', express.static(path.join(__dirname, '../public/admin')));

  // Play Store requires a live, publicly accessible policy page — not a
  // PDF/download — linked from the store listing and in-app.
  app.use('/privacy-policy', express.static(path.join(__dirname, '../public/privacy-policy')));

  // Required by Play Console's Data Safety form once account creation is
  // declared — must be a live page, not just a mailto: link.
  app.use('/delete-account', express.static(path.join(__dirname, '../public/delete-account')));

  app.use(errorHandler);

  return app;
}
