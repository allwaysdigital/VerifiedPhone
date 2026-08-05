import type { ShopDocument } from '../models/Shop';

declare global {
  namespace Express {
    interface Request {
      uid?: string;
      phoneNumber?: string;
      shop?: ShopDocument;
    }
  }
}

export {};
