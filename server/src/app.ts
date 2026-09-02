import express from 'express';
import cors from 'cors';
import shopsRoutes from './routes/shops.routes';
import devicesRoutes from './routes/devices.routes';
import brandsRoutes from './routes/brands.routes';
import subscriptionRoutes from './routes/subscription.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  // Uploaded images (device photos, shop logos) are stored in S3 and served
  // directly from there — see server/src/upload/s3Client.ts. Nothing is
  // written to local disk, since the app server's filesystem is ephemeral.

  app.get('/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/shops', shopsRoutes);
  app.use('/api/devices', devicesRoutes);
  app.use('/api/brands', brandsRoutes);
  app.use('/api/subscription', subscriptionRoutes);

  app.use(errorHandler);

  return app;
}
