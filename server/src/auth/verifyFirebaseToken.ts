import { createRemoteJWKSet, jwtVerify } from 'jose';

// Verifies Firebase Auth ID tokens by checking the signature against Google's
// published public keys, with no service account / ADC needed. Firebase ID
// tokens are standard signed JWTs — this is the same check firebase-admin
// performs internally for verifyIdToken(), done directly because this GCP
// project's org policy blocks creating a service account key.
const JWKS_URL =
  'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const jwks = createRemoteJWKSet(new URL(JWKS_URL));

export type DecodedFirebaseToken = {
  uid: string;
  phoneNumber?: string;
};

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedFirebaseToken> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID is not set');
  }

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  if (typeof payload.sub !== 'string' || !payload.sub) {
    throw new Error('Token is missing a subject (uid)');
  }

  return {
    uid: payload.sub,
    phoneNumber: typeof payload.phone_number === 'string' ? payload.phone_number : undefined,
  };
}
