import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
  type User,
} from '@react-native-firebase/auth';

export type { ConfirmationResult, User };

const auth = getAuth(getApp());

export function toE164(dialCode: string, localMobile: string): string {
  return `${dialCode}${localMobile}`;
}

export function sendOtp(dialCode: string, localMobile: string): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, toE164(dialCode, localMobile));
}

export function subscribeToAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export function getIdToken(): Promise<string | null> {
  return auth.currentUser ? auth.currentUser.getIdToken() : Promise.resolve(null);
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-phone-number': 'Enter a valid 10-digit mobile number.',
  'auth/missing-phone-number': 'Enter a valid 10-digit mobile number.',
  'auth/quota-exceeded': 'Too many attempts. Please try again later.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/invalid-verification-code': 'That OTP is incorrect. Please try again.',
  'auth/code-expired': 'This OTP has expired. Please resend and try again.',
  'auth/session-expired': 'This OTP has expired. Please resend and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  const code = (error as { code?: string })?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return fallback;
}
