import { buildConsentLetterHtml, consentLetterFileName } from '../../src/utils/consentLetter';
import { makeDevice } from '../../test-utils/mockDevice';

const shop = {
  id: 'shop-1',
  shopName: 'Maksud Collection',
  gstNumber: '',
  address: 'Ahmedabad',
  contactNumber: '9737218881',
  logoUrl: null,
  profileCompleted: true,
};

describe('VP-04 · Export Consent Letter', () => {
  test('contains the seller, the phone, the price and the shop', () => {
    const html = buildConsentLetterHtml(makeDevice({ declarationDate: '26/11/2026' }), shop, '26 Nov 2026');
    expect(html).toContain('Seller Consent &amp; Declaration');
    expect(html).toContain('Test Seller');
    expect(html).toContain('9999900001');
    expect(html).toContain('Samsung Galaxy A52');
    expect(html).toContain('356938035643809');
    expect(html).toContain('₹8,000');
    expect(html).toContain('Maksud Collection');
    expect(html).toContain('confirmed this declaration in the Verified Phone app on 26/11/2026');
  });

  test('does not claim a declaration that was never recorded', () => {
    const html = buildConsentLetterHtml(makeDevice(), shop, '26 Nov 2026');
    expect(html).toContain('No seller declaration was recorded');
    expect(html).not.toContain('confirmed this declaration');
  });

  test('includes uploaded identity documents only', () => {
    const html = buildConsentLetterHtml(
      makeDevice({ aadhaarFrontUrl: 'https://x/front.jpg', sellerPhotoUrl: null }),
      shop,
      '26 Nov 2026',
    );
    expect(html).toContain('https://x/front.jpg');
    expect(html).toContain('Aadhaar Front');
    expect(html).not.toContain('Seller Photo</div>');
  });

  test('file name is safe for the Downloads folder', () => {
    expect(consentLetterFileName(makeDevice())).toBe('ConsentLetter-356938035643809');
  });
});
