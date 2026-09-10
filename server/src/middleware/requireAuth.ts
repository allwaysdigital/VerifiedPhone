import type { NextFunction, Request, Response } from 'express';
import { verifyFirebaseIdToken } from '../auth/verifyFirebaseToken';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const idToken = header.slice('Bearer '.length);
  try {
    const decoded = await verifyFirebaseIdToken(idToken);
    req.uid = decoded.uid;
    req.phoneNumber = decoded.phoneNumber;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
