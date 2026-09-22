import { request } from './client';

export async function sendOtp(phoneNumber: string): Promise<{ sessionId: string }> {
  return request('/api/auth/send-otp', { method: 'POST', body: { phoneNumber } });
}

export async function verifyOtp(
  phoneNumber: string,
  sessionId: string,
  otp: string,
): Promise<{ token: string; profileCompleted: boolean }> {
  return request('/api/auth/verify-otp', {
    method: 'POST',
    body: { phoneNumber, sessionId, otp },
  });
}
