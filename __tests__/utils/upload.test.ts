import { removedOptionalImages } from '../../src/api/devices';
import { imageFieldToFormFile } from '../../src/api/client';
import { savingLabel } from '../../src/utils/upload';

describe('VP-07 · save progress text', () => {
  test('shows the upload percentage while photos are sending', () => {
    expect(savingLabel(0)).toBe('Uploading photos… 0%');
    expect(savingLabel(0.456)).toBe('Uploading photos… 46%');
  });

  test('says "Saving…" before progress is known and once the upload is done', () => {
    expect(savingLabel(null)).toBe('Saving…');
    expect(savingLabel(1)).toBe('Saving…');
  });
});

describe('VP-17 · editing only re-uploads changed photos', () => {
  test('a new local photo is uploaded', () => {
    expect(imageFieldToFormFile('file:///data/photo.jpg')).toEqual({
      uri: 'file:///data/photo.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
    });
  });

  test('a photo the server already has is not sent again', () => {
    expect(imageFieldToFormFile('https://cdn.example/front.jpg')).toBeUndefined();
    expect(imageFieldToFormFile('http://10.0.2.2:4000/uploads/front.jpg')).toBeUndefined();
    expect(imageFieldToFormFile(null)).toBeUndefined();
  });
});

describe('VP-17 · removing an optional photo while editing', () => {
  const base = {
    brand: 'Samsung', model: 'A52', color: '', ram: '', storage: '', condition: 'Good',
    batteryHealth: '', imei1: '', imei2: '', purchasePrice: '8000', expectedSalePrice: '',
    accessories: [], sellerName: 'S', sellerMobile: '9999900001', sellerAddress: '', sellerCity: '',
    phoneFrontImageUri: 'https://x/front.jpg',
    phoneBackImageUri: 'https://x/back.jpg',
    oldPhoneBillUri: null,
    sellerPhotoUri: null,
    aadhaarFrontUri: 'https://x/af.jpg',
    aadhaarBackUri: 'https://x/ab.jpg',
  };

  test('lists only the optional photos that are now empty', () => {
    expect(removedOptionalImages(base)).toEqual(['oldPhoneBill', 'sellerPhoto']);
  });

  test('never lists required photos', () => {
    expect(removedOptionalImages({ ...base, phoneFrontImageUri: null, aadhaarFrontUri: null })).toEqual([
      'oldPhoneBill',
      'sellerPhoto',
    ]);
  });
});
