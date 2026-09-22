import { SignJWT, jwtVerify } from 'jose';

// Session token for the admin panel — deliberately separate from
// appToken.ts (dealer sessions). Admins aren't a Shop, so this carries no
// uid/phoneNumber, just proof of a successful login. Short-lived since an
// admin is expected to log in again each session, not stay signed in for
// months like a dealer's phone.
const TOKEN_LIFETIME = '12h';

function getSecretKey(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is not set (see .env.example)');
  }
  return new TextEncoder().encode(secret);
}

export async function signAdminToken(): Promise<string> {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuedAt()
    .setExpirationTime(TOKEN_LIFETIME)
    .sign(getSecretKey());
}

export async function verifyAdminToken(token: string): Promise<void> {
  const { payload } = await jwtVerify(token, getSecretKey());
  if (payload.role !== 'admin') {
    throw new Error('Not an admin token');
  }
}
