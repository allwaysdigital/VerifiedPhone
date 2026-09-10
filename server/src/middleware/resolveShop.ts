import type { NextFunction, Request, Response } from 'express';
import { Shop } from '../models/Shop';

export async function resolveShop(req: Request, res: Response, next: NextFunction) {
  if (!req.uid) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  try {
    const shop = await Shop.findOneAndUpdate(
      { firebaseUid: req.uid },
      {
        $setOnInsert: {
          firebaseUid: req.uid,
          phoneNumber: req.phoneNumber,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    req.shop = shop;
    next();
  } catch (err) {
    next(err);
  }
}
