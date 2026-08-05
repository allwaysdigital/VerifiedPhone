/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AddSaleScreen from '../../src/screens/AddSaleScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import type { Device } from '../../src/types/domain';

const firstAvailableDevice: Device = {
  id: 'dev-1',
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
  accessories: ['Charger'],
  imei1: '356789012345678',
  purchasePrice: 55000,
  expectedSalePrice: 62000,
  profit: 7000,
  profitPercent: 12.7,
  sellerName: 'Rahul Sharma',
  sellerMobile: '+91 98765 43210',
  sellerCity: 'Mumbai, Maharashtra',
};

const firstAvailableLabel = `${firstAvailableDevice.model} - ₹${firstAvailableDevice.expectedSalePrice.toLocaleString('en-IN')}`;

function renderScreen(shopDataOverrides: Parameters<typeof createMockShopDataContext>[0] = {}) {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext({
    devices: [firstAvailableDevice],
    markDeviceSold: jest.fn().mockResolvedValue({ ...firstAvailableDevice, status: 'Sold' }),
    ...shopDataOverrides,
  });
  render(
    <ShopDataContext.Provider value={shopData}>
      <AddSaleScreen navigation={navigation} route={{ params: undefined } as any} />
    </ShopDataContext.Provider>,
  );
  return { navigation, shopData };
}

describe('AddSaleScreen', () => {
  test('does not navigate and shows every required-field error when submitted empty', () => {
    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText('Complete Sale & Generate Invoice'));

    // selectedPhone, customerName, paymentMode all fall back to the generic required message
    expect(screen.getAllByText('This field is required')).toHaveLength(3);
    expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeTruthy();
    expect(screen.getByText('Enter a valid amount greater than 0')).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('flags an invalid mobile number even once other fields are valid', () => {
    renderScreen();

    fireEvent.press(screen.getByText('Select Phone'));
    fireEvent.press(screen.getByText(firstAvailableLabel));
    fireEvent.changeText(screen.getByPlaceholderText('Enter  Customer name'), 'Test Customer');
    fireEvent.changeText(screen.getByPlaceholderText('Enter mobile no.'), '98765');
    fireEvent.press(screen.getByText('Select payment mode'));
    fireEvent.press(screen.getByText('Cash'));

    fireEvent.press(screen.getByText('Complete Sale & Generate Invoice'));

    expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeTruthy();
  });

  test('submits and navigates to InvoicePreview once the form is fully valid', async () => {
    const { navigation, shopData } = renderScreen();

    fireEvent.press(screen.getByText('Select Phone'));
    fireEvent.press(screen.getByText(firstAvailableLabel));
    fireEvent.changeText(screen.getByPlaceholderText('Enter  Customer name'), 'Test Customer');
    fireEvent.changeText(screen.getByPlaceholderText('Enter mobile no.'), '9876543210');
    fireEvent.press(screen.getByText('Select payment mode'));
    fireEvent.press(screen.getByText('Cash'));

    fireEvent.press(screen.getByText('Complete Sale & Generate Invoice'));

    await waitFor(() =>
      expect(shopData.markDeviceSold).toHaveBeenCalledWith(
        firstAvailableDevice.id,
        expect.objectContaining({
          buyerName: 'Test Customer',
          buyerMobile: '9876543210',
          salePrice: firstAvailableDevice.expectedSalePrice,
        }),
      ),
    );

    await waitFor(() =>
      expect(navigation.navigate).toHaveBeenCalledWith(
        'InvoicePreview',
        expect.objectContaining({
          deviceId: firstAvailableDevice.id,
          customerName: 'Test Customer',
          customerMobile: '9876543210',
          salePrice: firstAvailableDevice.expectedSalePrice,
        }),
      ),
    );
  });

  test('regression: the submit button stays pressable while invalid so errors are reachable', () => {
    // This guards against the bug found during manual testing: the button had
    // disabled={!canComplete}, which meant onPress never fired while the form
    // was invalid, so the very errors explaining why it was invalid could
    // never be shown.
    renderScreen();
    const button = screen.getByText('Complete Sale & Generate Invoice');

    expect(() => fireEvent.press(button)).not.toThrow();
    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0);
  });
});
