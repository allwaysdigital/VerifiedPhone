import { deviceName, formatAmount, formatAxisValue } from '../../src/utils/format';
import { niceYAxis } from '../../src/utils/chart';

describe('VP-08 · report totals show real rupees', () => {
  test('QA case: ₹8,000 purchase, ₹9,500 sale, ₹1,500 profit', () => {
    expect(formatAmount(8000)).toBe('₹8,000');
    expect(formatAmount(9500)).toBe('₹9,500');
    expect(formatAmount(1500)).toBe('₹1,500');
  });

  test('uses Indian grouping below ₹1 lakh', () => {
    expect(formatAmount(0)).toBe('₹0');
    expect(formatAmount(99999)).toBe('₹99,999');
  });

  test('switches to lakhs and crores with two decimals only above ₹1 lakh', () => {
    expect(formatAmount(100000)).toBe('₹1.00L');
    expect(formatAmount(1234567)).toBe('₹12.35L');
    expect(formatAmount(25000000)).toBe('₹2.50Cr');
  });

  test('keeps the sign for a loss', () => {
    expect(formatAmount(-1500)).toBe('-₹1,500');
  });
});

describe('VP-16 · chart Y-axis uses round steps', () => {
  const ticks = (max: number) => {
    const { yMax, yStep } = niceYAxis(max);
    return Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep);
  };

  test('QA case: highest value ₹9,500 gives 0, 2.5K, 5K, 7.5K, 10K', () => {
    expect(ticks(9500).map(formatAxisValue)).toEqual(['0', '2.5K', '5K', '7.5K', '10K']);
  });

  test('₹20,000 gives 0–25K in 5K steps, not 0–40K (found on the emulator)', () => {
    expect(ticks(20000).map(formatAxisValue)).toEqual(['0', '5K', '10K', '15K', '20K', '25K']);
  });

  test('the tallest bar fills at least ~half of the chart', () => {
    [150, 1500, 9500, 10000, 20000, 47000, 123456, 9_99_99_999].forEach(max => {
      expect(max / niceYAxis(max).yMax).toBeGreaterThan(0.45);
    });
  });

  test('always leaves room above the tallest bar', () => {
    [1, 99, 1500, 9500, 10000, 123456, 9_99_99_999].forEach(max => {
      expect(niceYAxis(max).yMax).toBeGreaterThanOrEqual(max);
    });
  });

  test('steps are always 1, 2, 2.5 or 5 × 10ⁿ', () => {
    [1500, 9500, 47000, 230000, 1_75_00_000].forEach(max => {
      const { yStep } = niceYAxis(max);
      const leading = yStep / 10 ** Math.floor(Math.log10(yStep));
      expect([1, 2, 2.5, 5]).toContain(leading);
    });
  });

  test('an empty chart still has a sensible axis', () => {
    expect(niceYAxis(0)).toEqual({ yMax: 100, yStep: 25 });
  });

  test('axis labels are short', () => {
    expect(formatAxisValue(0)).toBe('0');
    expect(formatAxisValue(500)).toBe('500');
    expect(formatAxisValue(150000)).toBe('1.5L');
    expect(formatAxisValue(20000000)).toBe('2Cr');
  });
});

describe('deviceName', () => {
  test('joins brand and model without repeating the brand', () => {
    expect(deviceName({ brand: 'Apple', model: 'iPhone18' })).toBe('Apple iPhone18');
    expect(deviceName({ brand: 'Samsung', model: 'Samsung A52' })).toBe('Samsung A52');
    expect(deviceName({ brand: 'vivo', model: 'Vivo Y21' })).toBe('Vivo Y21');
    expect(deviceName({ brand: '', model: 'Y21' })).toBe('Y21');
  });
});
