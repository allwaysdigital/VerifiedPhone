/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import OtpVerifyScreen from '../../src/screens/OtpVerifyScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';

function createConfirmation(overrides: Partial<{ confirm: jest.Mock }> = {}) {
  return {
    verificationId: 'test-verification-id',
    confirm: jest.fn().mockResolvedValue({ user: { uid: 'test-uid' } }),
    ...overrides,
  };
}

function renderScreen(confirmation = createConfirmation()) {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext();
  render(
    <ShopDataContext.Provider value={shopData}>
      <OtpVerifyScreen
        navigation={navigation}
        route={{ params: { phoneNumber: '9876543210', confirmation } } as any}
      />
    </ShopDataContext.Provider>,
  );
  return { navigation, confirmation, shopData };
}

describe('OtpVerifyScreen', () => {
  test('shows an error and does not log in when the OTP is empty', () => {
    const { navigation, confirmation } = renderScreen();

    fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('Enter the 6-digit OTP')).toBeTruthy();
    expect(navigation.reset).not.toHaveBeenCalled();
    expect(confirmation.confirm).not.toHaveBeenCalled();
  });

  test('rejects an OTP shorter than 6 digits', () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '1234');
    fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('Enter the 6-digit OTP')).toBeTruthy();
  });

  test('confirms with Firebase and resets to MainTabs with a valid 6-digit OTP', async () => {
    const { navigation, confirmation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      }),
    );
    expect(confirmation.confirm).toHaveBeenCalledWith('123456');
  });

  test('shows a friendly error when Firebase rejects the code', async () => {
    const confirmation = createConfirmation({
      confirm: jest.fn().mockRejectedValue({ code: 'auth/invalid-verification-code' }),
    });
    const { navigation } = renderScreen(confirmation);

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() =>
      expect(screen.getByText('That OTP is incorrect. Please try again.')).toBeTruthy(),
    );
    expect(navigation.reset).not.toHaveBeenCalled();
  });
});
