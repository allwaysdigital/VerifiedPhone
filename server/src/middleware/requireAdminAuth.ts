import type { NextFunction, Request, Response } from 'express';
import { verifyAdminToken } from '../auth/adminToken';

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  try {
    await verifyAdminToken(header.slice('Bearer '.length));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired admin session' });
  }
}
