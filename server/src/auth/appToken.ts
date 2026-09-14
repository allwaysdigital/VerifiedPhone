import { SignJWT, jwtVerify } from 'jose';

// The app's own session token, issued after a 2Factor OTP is verified —
// replaces the Firebase ID token now that phone verification no longer goes
// through Firebase. Same shape requireAuth already expects (a uid + phone
// number), just signed by us instead of Google.
//
// Long-lived on purpose: there's no refresh-token flow behind this (Firebase's
// SDK silently refreshed its own short-lived ID tokens; building an equivalent
// here wasn't worth it for this app). Re-authenticating is just another OTP,
// so a lapsed session is a minor inconvenience, not a dead end.
const TOKEN_LIFETIME = '90d';

function getSecretKey(): Uint8Array {
  const secret = process.env.APP_JWT_SECRET;
  if (!secret) {
    throw new Error('APP_JWT_SECRET is not set (see .env.example)');
  }
  return new TextEncoder().encode(secret);
}

export type AppTokenPayload = {
  uid: string;
  phoneNumber: string;
};

export async function signAppToken(payload: AppTokenPayload): Promise<string> {
  return new SignJWT({ phoneNumber: payload.phoneNumber })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.uid)
    .setIssuedAt()
    .setExpirationTime(TOKEN_LIFETIME)
    .sign(getSecretKey());
}

export async function verifyAppToken(token: string): Promise<AppTokenPayload> {
  const { payload } = await jwtVerify(token, getSecretKey());
  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Token is missing a subject (uid)');
  }
  return {
    uid: payload.sub,
    phoneNumber: typeof payload.phoneNumber === 'string' ? payload.phoneNumber : '',
  };
}
