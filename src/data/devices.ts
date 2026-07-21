export type DeviceStatus = 'Available' | 'Sold';
export type VerificationStatus = 'Verified' | 'Suspicious';

export type Device = {
  id: string;
  brand: string;
  model: string;
  status: DeviceStatus;
  verification: VerificationStatus;
  color: string;
  condition: string;
  ram: string;
  storage: string;
  batteryHealth: number;
  purchaseDate: string;
  accessories: string[];
  imei1: string;
  imei2?: string;
  purchasePrice: number;
  expectedSalePrice: number;
  profit: number;
  profitPercent: number;
  sellerName: string;
  sellerMobile: string;
  sellerCity: string;
};

export const devices: Device[] = [
  {
    id: '1',
    brand: 'Apple',
    model: 'Apple iPhone 13 Pro',
    status: 'Available',
    verification: 'Verified',
    color: 'Sierra Blue',
    condition: 'Excellent',
    ram: '6GB',
    storage: '256GB',
    batteryHealth: 89,
    purchaseDate: '20/2/2026',
    accessories: ['Charger', 'Box', 'Cable'],
    imei1: '356789012345678',
    imei2: '356789012345678',
    purchasePrice: 55000,
    expectedSalePrice: 62000,
    profit: 7000,
    profitPercent: 12.7,
    sellerName: 'Rahul Sharma',
    sellerMobile: '+91 98765 43210',
    sellerCity: 'Mumbai, Maharashtra',
  },
  {
    id: '2',
    brand: 'OnePlus',
    model: 'OnePlus 10 Pro',
    status: 'Available',
    verification: 'Verified',
    color: 'Emerald Forest',
    condition: 'Good',
    ram: '6GB',
    storage: '256GB',
    batteryHealth: 90,
    purchaseDate: '18/2/2026',
    accessories: ['Box'],
    imei1: '356789012345678',
    purchasePrice: 32000,
    expectedSalePrice: 38000,
    profit: 6000,
    profitPercent: 18.75,
    sellerName: 'Himanshi Jeengar',
    sellerMobile: '+91 91234 56780',
    sellerCity: 'Pune, Maharashtra',
  },
  {
    id: '3',
    brand: 'Xiaomi',
    model: 'Xiaomi Mi 11 Ultra',
    status: 'Available',
    verification: 'Suspicious',
    color: 'Ceramic Black',
    condition: 'Fair',
    ram: '6GB',
    storage: '256GB',
    batteryHealth: 90,
    purchaseDate: '15/2/2026',
    accessories: ['Cable'],
    imei1: '356789012345678',
    purchasePrice: 55000,
    expectedSalePrice: 62000,
    profit: 7000,
    profitPercent: 12.7,
    sellerName: 'Priya Patel',
    sellerMobile: '+91 90000 11111',
    sellerCity: 'Delhi',
  },
  {
    id: '4',
    brand: 'Xiaomi',
    model: 'Xiaomi Mi 11 Ultra',
    status: 'Sold',
    verification: 'Verified',
    color: 'Ceramic Black',
    condition: 'Excellent',
    ram: '6GB',
    storage: '256GB',
    batteryHealth: 89,
    purchaseDate: '10/2/2026',
    accessories: ['Box', 'Cable'],
    imei1: '356789012345678',
    purchasePrice: 38000,
    expectedSalePrice: 42000,
    profit: 4000,
    profitPercent: 10.5,
    sellerName: 'Priya Patel',
    sellerMobile: '+91 90000 11111',
    sellerCity: 'Delhi',
  },
  {
    id: '5',
    brand: 'Samsung',
    model: 'Samsung Galaxy S23',
    status: 'Available',
    verification: 'Verified',
    color: 'Phantom Black',
    condition: 'Excellent',
    ram: '8GB',
    storage: '256GB',
    batteryHealth: 93,
    purchaseDate: '22/2/2026',
    accessories: ['Charger', 'Box'],
    imei1: '356789012345678',
    imei2: '356789012345678',
    purchasePrice: 45000,
    expectedSalePrice: 52000,
    profit: 7000,
    profitPercent: 15.5,
    sellerName: 'Amit Verma',
    sellerMobile: '+91 99887 66554',
    sellerCity: 'Bengaluru, Karnataka',
  },
];
