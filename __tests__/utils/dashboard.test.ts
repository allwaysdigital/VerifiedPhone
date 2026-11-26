import { brandDistribution, stockSummary } from '../../src/utils/dashboard';
import { makeDevice, makeSoldDevice } from '../../test-utils/mockDevice';

describe('VP-05 · Brand-wise Distribution counts stock only', () => {
  test('a sold phone is not counted (QA case)', () => {
    expect(brandDistribution([makeSoldDevice()])).toEqual([]);
  });

  test('counts and values only available phones per brand', () => {
    const rows = brandDistribution([
      makeDevice({ id: 'a', brand: 'Samsung', purchasePrice: 8000 }),
      makeDevice({ id: 'b', brand: 'Samsung', purchasePrice: 12000 }),
      makeSoldDevice({ id: 'c', brand: 'Samsung' }),
      makeDevice({ id: 'd', brand: 'Apple', purchasePrice: 30000 }),
    ]);
    expect(rows).toEqual([
      { brand: 'Apple', units: '1 unit', value: '₹30,000', deviceIds: ['d'] },
      { brand: 'Samsung', units: '2 units', value: '₹20,000', deviceIds: ['a', 'b'] },
    ]);
  });
});

describe('VP-09 · Total Stock card summary', () => {
  test('is hidden when nothing is in stock', () => {
    expect(stockSummary([])).toBeUndefined();
    expect(stockSummary([makeSoldDevice()])).toBeUndefined();
  });

  test('names the phone when there is one in stock', () => {
    expect(stockSummary([makeDevice()])).toBe('Samsung Galaxy A52');
  });

  test('names the newest phone plus a count of the rest', () => {
    expect(
      stockSummary([
        makeDevice({ id: 'new', brand: 'Apple', model: 'iPhone 13' }),
        makeDevice({ id: 'old1' }),
        makeDevice({ id: 'old2' }),
      ]),
    ).toBe('Apple iPhone 13 +2 more');
  });

  test('does not repeat the brand when the model already includes it', () => {
    expect(stockSummary([makeDevice({ brand: 'Samsung', model: 'Samsung A52' })])).toBe('Samsung A52');
  });
});
