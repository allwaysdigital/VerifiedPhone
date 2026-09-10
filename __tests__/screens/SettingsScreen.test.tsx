/**
 * @format
 */

import React from 'react';
import { TextInput } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';

// Field order as rendered: Shop Name, GST Number, Address, Contact Number
function getFields() {
  const inputs = screen.UNSAFE_getAllByType(TextInput);
  return {
    shopName: inputs[0],
    gstNumber: inputs[1],
    address: inputs[2],
    contactNumber: inputs[3],
  };
}

function renderScreen(shopDataOverrides: Parameters<typeof createMockShopDataContext>[0] = {}) {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext({
    shop: {
      id: 'shop-1',
      shopName: 'Mobile Hub',
      gstNumber: '27AABCU9603R1ZM',
      address: '',
      contactNumber: '9876543210',
      logoUrl: null,
    },
    subscription: {
      status: 'trial',
      planId: 'monthly',
      trialEndsAt: null,
      expiredOn: null,
      paymentMethod: 'UPI (ending 1234)',
    },
    updateShop: jest.fn().mockResolvedValue(undefined),
    ...shopDataOverrides,
  });
  render(
    <ShopDataContext.Provider value={shopData}>
      <SettingsScreen navigation={navigation} route={{} as any} />
    </ShopDataContext.Provider>,
  );
  return { navigation, shopData };
}

describe('SettingsScreen shop details form', () => {
  test('requires an address before saving', () => {
    renderScreen();

    fireEvent.press(screen.getByText('Save Shop Details'));

    expect(screen.getByText('This field is required')).toBeTruthy();
  });

  test('rejects a badly formatted GST number', () => {
    renderScreen();
    const { gstNumber, address } = getFields();

    fireEvent.changeText(gstNumber, 'BADGST123');
    fireEvent.changeText(address, '123 Main Street');
    fireEvent.press(screen.getByText('Save Shop Details'));

    expect(
      screen.getByText('Enter a valid GST number (e.g., 27AABCU9603R1ZM)'),
    ).toBeTruthy();
    expect(screen.queryByText('This field is required')).toBeNull();
  });

  test('accepts a fully valid form and saves it', async () => {
    const { shopData } = renderScreen();
    const { address } = getFields();

    fireEvent.changeText(address, '123 Main Street, Mumbai');
    fireEvent.press(screen.getByText('Save Shop Details'));

    expect(screen.queryByText('This field is required')).toBeNull();
    expect(
      screen.queryByText('Enter a valid GST number (e.g., 27AABCU9603R1ZM)'),
    ).toBeNull();
    await waitFor(() =>
      expect(shopData.updateShop).toHaveBeenCalledWith(
        expect.objectContaining({ address: '123 Main Street, Mumbai' }),
      ),
    );
  });
});
