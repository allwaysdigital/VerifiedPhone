export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isValidMobile(value: string): boolean {
  return /^\d{10}$/.test(value.trim());
}

export function isValidOtp(value: string, length: number = 6): boolean {
  return new RegExp(`^\\d{${length}}$`).test(value.trim());
}

export function isValidImei(value: string): boolean {
  return /^\d{15}$/.test(value.trim());
}

export function isValidGst(value: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$/.test(value.trim().toUpperCase());
}

export function isPositiveNumber(value: string): boolean {
  const num = Number(value);
  return value.trim().length > 0 && Number.isFinite(num) && num > 0;
}

export function isPercentage(value: string): boolean {
  const num = Number(value);
  return value.trim().length > 0 && Number.isFinite(num) && num >= 0 && num <= 100;
}

export const REQUIRED_MESSAGE = 'This field is required';
export const MOBILE_MESSAGE = 'Enter a valid 10-digit mobile number';
export const IMEI_MESSAGE = 'Enter a valid 15-digit IMEI number';
export const GST_MESSAGE = 'Enter a valid GST number (e.g., 27AABCU9603R1ZM)';
export const PRICE_MESSAGE = 'Enter a valid amount greater than 0';
export const PERCENTAGE_MESSAGE = 'Enter a value between 0 and 100';
