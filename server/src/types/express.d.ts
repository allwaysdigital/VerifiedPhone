import type { ShopDocument } from '../models/Shop';

declare global {
  namespace Express {
    interface Request {
      uid?: string;
      phoneNumber?: string;
      shop?: ShopDocument;
      // Raw request bytes, captured by express.json()'s verify hook in
      // app.ts — needed to check the Razorpay webhook's HMAC signature,
      // which is computed over the exact bytes sent, not the parsed object.
      rawBody?: Buffer;
    }
  }
}

export {};
