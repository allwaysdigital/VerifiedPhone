import { buildInvoiceHtml, shopHeaderLines } from '../../src/utils/invoice';
import { makeSoldDevice } from '../../test-utils/mockDevice';

const QA_SHOP = { address: 'Ahmedabad', contactNumber: '9737218881', gstNumber: '' };

function invoiceHtml(overrides: Partial<Parameters<typeof buildInvoiceHtml>[0]> = {}) {
  return buildInvoiceHtml({
    shopName: 'Maksud Collection',
    shopLines: shopHeaderLines(QA_SHOP),
    invoiceNumber: 'MC/2026-27/0001',
    invoiceDate: '26/11/2026',
    device: makeSoldDevice(),
    customerName: 'Test Buyer',
    customerMobile: '9999900002',
    customerAddress: 'Test Address',
    salePrice: 9500,
    warrantyPeriod: '3 months',
    ...overrides,
  });
}

describe('VP-01 · invoice header uses the shop’s own details', () => {
  test('shows the saved address and contact, and no GST line when GST is empty', () => {
    expect(shopHeaderLines(QA_SHOP)).toEqual(['Ahmedabad', 'Contact: 9737218881']);
  });

  test('includes the GST line when the shop has a GST number', () => {
    expect(shopHeaderLines({ ...QA_SHOP, gstNumber: '24ABCDE1234F1Z5' })).toContain('GST: 24ABCDE1234F1Z5');
  });

  test('leaves out every empty field', () => {
    expect(shopHeaderLines({ address: '  ', contactNumber: '', gstNumber: '' })).toEqual([]);
    expect(shopHeaderLines(null)).toEqual([]);
  });

  test('the PDF never contains the old placeholder shop details', () => {
    const html = invoiceHtml();
    expect(html).toContain('Ahmedabad');
    expect(html).toContain('Contact: 9737218881');
    expect(html).not.toContain('123 Main Street');
    expect(html).not.toContain('98765 43210');
    expect(html).not.toContain('27AABCU9603R1ZM');
    expect(html).not.toContain('GST:');
  });

  test('escapes customer-entered text in the PDF', () => {
    const html = invoiceHtml({ customerName: '<b>Ram & Sons</b>' });
    expect(html).toContain('&lt;b&gt;Ram &amp; Sons&lt;/b&gt;');
    expect(html).not.toContain('<b>Ram');
  });
});

describe('VP-02 · invoice shows the stored invoice number', () => {
  test('prints the invoice number it is given, unchanged', () => {
    expect(invoiceHtml()).toContain('MC/2026-27/0001');
  });
});

describe('Invoice "Brand & Model" line shows both (found on the emulator)', () => {
  test('includes the brand, not just the model', () => {
    const html = invoiceHtml({ device: makeSoldDevice({ brand: 'Apple', model: 'iPhone18' }) });
    expect(html).toContain('Brand & Model:</span> Apple iPhone18');
  });
});
