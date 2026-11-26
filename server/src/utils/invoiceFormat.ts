// Pure invoice-number formatting (no database access), shared by
// invoiceNumber.ts and covered by the app's test suite.

// Indian financial year (1 April – 31 March), e.g. 2026-27, in IST.
export function financialYear(date: Date): string {
  const ist = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  const year = ist.getUTCFullYear();
  const start = ist.getUTCMonth() >= 3 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

// Initials of the shop name ("Maksud Collection" → "MC"), max 3 letters.
export function invoicePrefix(shopName: string | null | undefined): string {
  const initials = (shopName ?? '')
    .split(/\s+/)
    .map(word => word.replace(/[^A-Za-z]/g, '').charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);
  return initials || 'INV';
}

export function formatInvoiceNumber(prefix: string, fy: string, sequence: number): string {
  return `${prefix}/${fy}/${String(sequence).padStart(4, '0')}`;
}
