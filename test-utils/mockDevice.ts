import type { Device } from '../src/types/domain';

// A purchased phone matching the QA report's test data (Samsung "TEST Galaxy A52").
export function makeDevice(overrides: Partial<Device> = {}): Device {
  return {
    id: 'device-1',
    brand: 'Samsung',
    model: 'Galaxy A52',
    status: 'Available',
    verification: 'Verified',
    color: 'Black',
    condition: 'Good',
    ram: '6GB',
    storage: '128GB',
    batteryHealth: 85,
    purchaseDate: '26/11/2026',
    accessories: ['Charger', 'Box'],
    imei1: '356938035643809',
    purchasePrice: 8000,
    expectedSalePrice: 10000,
    profit: 2000,
    profitPercent: 25,
    sellerName: 'Test Seller',
    sellerMobile: '9999900001',
    sellerCity: 'Ahmedabad',
    ...overrides,
  };
}

// The same phone after the QA test sale.
export function makeSoldDevice(overrides: Partial<Device> = {}): Device {
  return makeDevice({
    status: 'Sold',
    saleDate: '26/11/2026',
    buyerName: 'Test Buyer',
    buyerMobile: '9999900002',
    buyerAddress: 'Test Address',
    salePrice: 9500,
    profit: 1500,
    profitPercent: 18.75,
    warrantyPeriod: '3 months',
    invoiceNumber: 'MC/2026-27/0001',
    ...overrides,
  });
}
