/**
 * @format
 */

import {
  isPercentage,
  isPositiveNumber,
  isRequired,
  isValidGst,
  isValidImei,
  isValidMobile,
  isValidOtp,
} from '../src/utils/validators';

describe('isRequired', () => {
  test('rejects an empty string', () => {
    expect(isRequired('')).toBe(false);
  });

  test('rejects a whitespace-only string', () => {
    expect(isRequired('   ')).toBe(false);
  });

  test('accepts a non-empty string', () => {
    expect(isRequired('Mobile Hub')).toBe(true);
  });

  test('accepts a string with surrounding whitespace', () => {
    expect(isRequired('  Mobile Hub  ')).toBe(true);
  });
});

describe('isValidMobile', () => {
  test('accepts a 10-digit number', () => {
    expect(isValidMobile('9876543210')).toBe(true);
  });

  test('rejects fewer than 10 digits', () => {
    expect(isValidMobile('987654321')).toBe(false);
  });

  test('rejects more than 10 digits', () => {
    expect(isValidMobile('98765432100')).toBe(false);
  });

  test('rejects non-digit characters', () => {
    expect(isValidMobile('98765abcde')).toBe(false);
  });

  test('rejects a number with a country code prefix', () => {
    expect(isValidMobile('+919876543210')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isValidMobile('')).toBe(false);
  });

  test('trims surrounding whitespace before validating', () => {
    expect(isValidMobile('  9876543210  ')).toBe(true);
  });
});

describe('isValidOtp', () => {
  test('accepts a 6-digit code by default', () => {
    expect(isValidOtp('123456')).toBe(true);
  });

  test('rejects fewer than 6 digits by default', () => {
    expect(isValidOtp('1234')).toBe(false);
  });

  test('rejects more than 6 digits by default', () => {
    expect(isValidOtp('1234567')).toBe(false);
  });

  test('rejects non-digit characters', () => {
    expect(isValidOtp('12345a')).toBe(false);
  });

  test('respects a custom length', () => {
    expect(isValidOtp('1234', 4)).toBe(true);
    expect(isValidOtp('123', 4)).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isValidOtp('')).toBe(false);
  });
});

describe('isValidImei', () => {
  test('accepts a 15-digit IMEI', () => {
    expect(isValidImei('356789012345678')).toBe(true);
  });

  test('rejects fewer than 15 digits', () => {
    expect(isValidImei('35678901234567')).toBe(false);
  });

  test('rejects more than 15 digits', () => {
    expect(isValidImei('3567890123456789')).toBe(false);
  });

  test('rejects non-digit characters', () => {
    expect(isValidImei('35678901234567X')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isValidImei('')).toBe(false);
  });
});

describe('isValidGst', () => {
  test('accepts a well-formed GST number', () => {
    expect(isValidGst('27AABCU9603R1ZM')).toBe(true);
  });

  test('accepts a lowercase GST number', () => {
    expect(isValidGst('27aabcu9603r1zm')).toBe(true);
  });

  test('rejects a GST number that is too short', () => {
    expect(isValidGst('27AABCU9603R1Z')).toBe(false);
  });

  test('rejects a GST number missing the mandatory "Z"', () => {
    expect(isValidGst('27AABCU9603R1XM')).toBe(false);
  });

  test('rejects a GST number with an invalid state code position', () => {
    expect(isValidGst('AAAABCU9603R1ZM')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isValidGst('')).toBe(false);
  });
});

describe('isPositiveNumber', () => {
  test('accepts a positive integer', () => {
    expect(isPositiveNumber('55000')).toBe(true);
  });

  test('accepts a positive decimal', () => {
    expect(isPositiveNumber('99.5')).toBe(true);
  });

  test('rejects zero', () => {
    expect(isPositiveNumber('0')).toBe(false);
  });

  test('rejects a negative number', () => {
    expect(isPositiveNumber('-100')).toBe(false);
  });

  test('rejects a non-numeric string', () => {
    expect(isPositiveNumber('abc')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isPositiveNumber('')).toBe(false);
  });

  test('rejects a whitespace-only string', () => {
    expect(isPositiveNumber('   ')).toBe(false);
  });
});

describe('isPercentage', () => {
  test('accepts 0', () => {
    expect(isPercentage('0')).toBe(true);
  });

  test('accepts 100', () => {
    expect(isPercentage('100')).toBe(true);
  });

  test('accepts a value in between', () => {
    expect(isPercentage('85')).toBe(true);
  });

  test('rejects a value above 100', () => {
    expect(isPercentage('101')).toBe(false);
  });

  test('rejects a negative value', () => {
    expect(isPercentage('-1')).toBe(false);
  });

  test('rejects a non-numeric string', () => {
    expect(isPercentage('abc')).toBe(false);
  });

  test('rejects an empty string', () => {
    expect(isPercentage('')).toBe(false);
  });
});
