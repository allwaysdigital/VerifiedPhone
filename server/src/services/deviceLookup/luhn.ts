// IMEI's 15th digit is a Luhn (mod 10) check digit computed over the first 14.
// Verified against the commonly-cited test IMEI 490154203237518 (check digit 8).
export function isValidImeiChecksum(imei: string): boolean {
  if (!/^\d{15}$/.test(imei)) {
    return false;
  }

  const digits = imei.split('').map(Number);
  const checkDigit = digits[14];
  const payload = digits.slice(0, 14);

  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    const posFromRight = payload.length - i;
    let digit = payload[i];
    if (posFromRight % 2 === 1) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
  }

  const computedCheckDigit = (10 - (sum % 10)) % 10;
  return computedCheckDigit === checkDigit;
}
