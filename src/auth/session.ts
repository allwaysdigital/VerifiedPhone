import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendOtp as apiSendOtp, verifyOtp as apiVerifyOtp } from '../api/auth';
import { ApiError } from '../api/apiError';

// Phone verification goes through 2Factor now, not Firebase — this module
// replaces firebaseAuth.ts as the single place that owns the session token
// and the sign-in/sign-out lifecycle. There's no SDK holding a live session
// for us anymore, so the token is persisted here explicitly and a small
// listener list stands in for Firebase's onAuthStateChanged stream.

const TOKEN_KEY = 'verifiedphone.sessionToken';

let cachedToken: string | null | undefined; // undefined = not loaded from storage yet
const listeners = new Set<(signedIn: boolean) => void>();

async function loadToken(): Promise<string | null> {
  if (cachedToken === undefined) {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
  }
  return cachedToken;
}

function notify(signedIn: boolean) {
  listeners.forEach(listener => listener(signedIn));
}

export function toE164(dialCode: string, localMobile: string): string {
  return `${dialCode}${localMobile}`;
}

// Kicks off the OTP SMS via the backend (which calls 2Factor) and returns the
// session id needed to verify whatever code the user types next.
export async function sendOtp(dialCode: string, localMobile: string): Promise<string> {
  const { sessionId } = await apiSendOtp(toE164(dialCode, localMobile));
  return sessionId;
}

// Checks the OTP against that session; on success, persists the app's own
// session token and notifies anything listening via subscribeToAuthState.
export async function verifyOtp(
  dialCode: string,
  localMobile: string,
  sessionId: string,
  otp: string,
): Promise<void> {
  const { token } = await apiVerifyOtp(toE164(dialCode, localMobile), sessionId, otp);
  cachedToken = token;
  await AsyncStorage.setItem(TOKEN_KEY, token);
  notify(true);
}

// Fires once immediately with the current signed-in state, then again on
// every sign-in/sign-out — mirrors Firebase's onAuthStateChanged shape so
// call sites (ShopDataContext, SplashScreen) didn't need to change.
export function subscribeToAuthState(callback: (signedIn: boolean) => void): () => void {
  let cancelled = false;
  loadToken().then(token => {
    if (!cancelled) {
      callback(!!token);
    }
  });
  listeners.add(callback);
  return () => {
    cancelled = true;
    listeners.delete(callback);
  };
}

export async function logout(): Promise<void> {
  cachedToken = null;
  await AsyncStorage.removeItem(TOKEN_KEY);
  notify(false);
}

export function getToken(): Promise<string | null> {
  return loadToken();
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  return fallback;
}
