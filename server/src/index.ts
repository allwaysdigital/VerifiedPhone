import 'dotenv/config';
import { connectDb } from './db';
import { createApp } from './app';
import { seedDefaultBrandsIfEmpty } from './models/Brand';

async function main() {
  if (!process.env.FIREBASE_PROJECT_ID) {
    throw new Error('FIREBASE_PROJECT_ID is not set (see .env.example)');
  }
  if (!process.env.APP_JWT_SECRET) {
    throw new Error('APP_JWT_SECRET is not set (see .env.example)');
  }
  if (!process.env.TWO_FACTOR_API_KEY) {
    console.warn(
      'TWO_FACTOR_API_KEY is not set — OTP login will fail until it is added to .env',
    );
  }
  await connectDb();
  await seedDefaultBrandsIfEmpty();

  const app = createApp();
  const port = Number(process.env.PORT) || 4000;
  app.listen(port, () => {
    console.log(`VerifiedPhone API listening on port ${port}`);
  });
}

main().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
