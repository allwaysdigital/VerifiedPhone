import {
  buildPoliceExportRecordHtml,
  imeiStatus,
  verificationRows,
} from '../../src/utils/policeExportRecord';
import { makeSoldDevice } from '../../test-utils/mockDevice';

const statusOf = (rows: ReturnType<typeof verificationRows>, label: string) =>
  rows.find(r => r.label === label)?.status;

describe('VP-03 · police record only states what really happened', () => {
  test('QA case: no seller photo, Aadhaar images attached, declaration signed', () => {
    const rows = verificationRows(
      makeSoldDevice({
        sellerPhotoUrl: null,
        aadhaarFrontUrl: 'https://x/front.jpg',
        aadhaarBackUrl: 'https://x/back.jpg',
        phoneFrontImageUrl: 'https://x/phone.jpg',
        declarationDate: '26/11/2026',
      }),
    );
    expect(statusOf(rows, 'Seller Live Photo')).toBe('Not provided');
    expect(statusOf(rows, 'Aadhaar Card (Front & Back)')).toBe('Uploaded');
    expect(statusOf(rows, 'Digital Signature')).toBe('Signed');
    expect(statusOf(rows, 'Device Images')).toBe('Front only');
  });

  test('never says Verified or Captured', () => {
    const rows = verificationRows(
      makeSoldDevice({ sellerPhotoUrl: 'https://x/seller.jpg', aadhaarFrontUrl: 'a', aadhaarBackUrl: 'b' }),
    );
    rows.forEach(row => {
      expect(row.status).not.toBe('Verified');
      expect(row.status).not.toBe('Captured');
    });
  });

  test('marks missing items as not provided', () => {
    const rows = verificationRows(makeSoldDevice());
    expect(rows.every(r => !r.provided)).toBe(true);
    expect(statusOf(rows, 'Digital Signature')).toBe('Not signed');
  });

  test('IMEI is "Not checked" — the app has no IMEI lookup', () => {
    expect(imeiStatus(makeSoldDevice())).toBe('Not checked');
    expect(imeiStatus(makeSoldDevice({ imei1: '' }))).toBe('Not provided');
  });

  test('the PDF has no false claims and no declaration when none was recorded', () => {
    const html = buildPoliceExportRecordHtml({
      device: makeSoldDevice({ verification: 'Verified' }),
      shop: null,
      recordGenerated: '26/11/2026',
    });
    expect(html).not.toContain('>Verified<');
    expect(html).not.toContain('Captured');
    expect(html).toContain('Not checked');
    expect(html).toContain('No seller declaration was recorded');
    expect(html).not.toContain('Seller has declared');
  });
});
