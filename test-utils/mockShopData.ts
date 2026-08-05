import type { ShopDataState } from '../src/context/ShopDataContext';

export function createMockShopDataContext(overrides: Partial<ShopDataState> = {}): ShopDataState {
  return {
    shop: null,
    devices: [],
    brands: [],
    subscription: null,
    loading: false,
    error: null,
    refetchAll: jest.fn().mockResolvedValue(undefined),
    createDevice: jest.fn(),
    markDeviceSold: jest.fn(),
    createBrand: jest.fn(),
    registerShop: jest.fn(),
    updateShop: jest.fn(),
    startTrial: jest.fn(),
    cancelSubscription: jest.fn(),
    ...overrides,
  };
}
