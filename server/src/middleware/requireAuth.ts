import type { NextFunction, Request, Response } from 'express';
import { verifyFirebaseIdToken } from '../auth/verifyFirebaseToken';
import { verifyAppToken } from '../auth/appToken';

// Phone verification now happens through 2Factor, whose tokens are signed by
// us (see auth/appToken.ts) — that's tried first. Falling back to Firebase ID
// token verification is a transition shim only, so installs that logged in
// before this shipped aren't signed out the moment it deploys; once every
// active session has naturally re-logged-in past its token lifetime, the
// Firebase fallback (and verifyFirebaseToken.ts) can be deleted.
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Authorization header' });
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const decoded = await verifyAppToken(token);
    req.uid = decoded.uid;
    req.phoneNumber = decoded.phoneNumber;
    next();
    return;
  } catch {
    // Not one of our tokens (or expired) — see if it's a still-valid legacy
    // Firebase ID token before giving up.
  }

  try {
    const decoded = await verifyFirebaseIdToken(token);
    req.uid = decoded.uid;
    req.phoneNumber = decoded.phoneNumber;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
