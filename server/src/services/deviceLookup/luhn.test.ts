import assert from 'node:assert/strict';
import { isValidImeiChecksum } from './luhn';

// 490154203237518 is a commonly-cited Luhn-valid test IMEI (check digit 8).
assert.equal(isValidImeiChecksum('490154203237518'), true, 'known-valid IMEI should pass');
assert.equal(isValidImeiChecksum('490154203237519'), false, 'wrong check digit should fail');
assert.equal(isValidImeiChecksum('12345'), false, 'wrong length should fail');
assert.equal(isValidImeiChecksum('49015420323751a'), false, 'non-digit characters should fail');
assert.equal(isValidImeiChecksum('000000000000000'), true, 'all-zero IMEI is trivially Luhn-valid');

console.log('luhn.test.ts: all assertions passed');
