import {
  financialYear,
  formatInvoiceNumber,
  invoicePrefix,
} from '../../server/src/utils/invoiceFormat';

describe('VP-02 · sequential invoice numbers per shop and financial year', () => {
  test('uses the Indian financial year (April–March)', () => {
    expect(financialYear(new Date('2026-11-26T09:00:00Z'))).toBe('2026-27');
    expect(financialYear(new Date('2027-03-31T12:00:00Z'))).toBe('2026-27');
    expect(financialYear(new Date('2027-04-01T00:00:00+05:30'))).toBe('2027-28');
  });

  test('a sale late on 31 March IST still belongs to the old financial year', () => {
    // 23:30 IST on 31 March is 18:00 UTC the same day
    expect(financialYear(new Date('2027-03-31T18:00:00Z'))).toBe('2026-27');
    // 00:30 IST on 1 April is still 31 March in UTC
    expect(financialYear(new Date('2027-03-31T19:00:00Z'))).toBe('2027-28');
  });

  test('prefixes with the shop’s initials', () => {
    expect(invoicePrefix('Maksud Collection')).toBe('MC');
    expect(invoicePrefix('Makvana Phone')).toBe('MP');
    expect(invoicePrefix('Shree Ram Mobile Shop')).toBe('SRM');
    expect(invoicePrefix('  ')).toBe('INV');
    expect(invoicePrefix(null)).toBe('INV');
  });

  test('formats as PREFIX/FY/0001', () => {
    expect(formatInvoiceNumber('MC', '2026-27', 1)).toBe('MC/2026-27/0001');
    expect(formatInvoiceNumber('MC', '2026-27', 123)).toBe('MC/2026-27/0123');
  });
});
