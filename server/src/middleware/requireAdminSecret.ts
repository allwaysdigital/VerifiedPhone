import type { NextFunction, Request, Response } from 'express';

// Simple shared-secret gate for backend-only management endpoints (adding or
// removing OTP bypass numbers) — the app has no admin/role system, so a
// header checked against a server-only env var stands in for one.
export function requireAdminSecret(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    res.status(503).json({ error: 'ADMIN_SECRET is not configured on the server.' });
    return;
  }
  if (req.headers['x-admin-secret'] !== secret) {
    res.status(401).json({ error: 'Invalid admin secret.' });
    return;
  }
  next();
}
