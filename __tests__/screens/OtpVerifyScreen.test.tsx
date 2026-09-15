/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import OtpVerifyScreen from '../../src/screens/OtpVerifyScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import { ApiError } from '../../src/api/apiError';

jest.mock('../../src/auth/session', () => ({
  verifyOtp: jest.fn().mockResolvedValue({ profileCompleted: true }),
  sendOtp: jest.fn().mockResolvedValue('next-session-id'),
  getAuthErrorMessage: jest.requireActual('../../src/auth/session').getAuthErrorMessage,
}));

const { verifyOtp } = jest.requireMock('../../src/auth/session');

function renderScreen(routeOverrides: Record<string, unknown> = {}) {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext();
  render(
    <ShopDataContext.Provider value={shopData}>
      <OtpVerifyScreen
        navigation={navigation}
        route={{
          params: {
            dialCode: '+91',
            phoneNumber: '9876543210',
            sessionId: 'test-session-id',
            ...routeOverrides,
          },
        } as any}
      />
    </ShopDataContext.Provider>,
  );
  return { navigation, shopData };
}

describe('OtpVerifyScreen', () => {
  beforeEach(() => {
    verifyOtp.mockClear();
    verifyOtp.mockResolvedValue({ profileCompleted: true });
  });

  test('shows an error and does not log in when the OTP is empty', () => {
    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('Enter the 6-digit OTP')).toBeTruthy();
    expect(navigation.reset).not.toHaveBeenCalled();
    expect(verifyOtp).not.toHaveBeenCalled();
  });

  test('rejects an OTP shorter than 6 digits', () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '1234');
    fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('Enter the 6-digit OTP')).toBeTruthy();
  });

  test('verifies and resets to MainTabs when the shop profile is already complete', async () => {
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      }),
    );
    expect(verifyOtp).toHaveBeenCalledWith('+91', '9876543210', 'test-session-id', '123456');
  });

  test('routes to CompleteProfile for a shop that has never saved details', async () => {
    verifyOtp.mockResolvedValueOnce({ profileCompleted: false });
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'CompleteProfile' }],
      }),
    );
  });

  test('shows a friendly error when the OTP is rejected', async () => {
    verifyOtp.mockRejectedValueOnce(
      new ApiError(401, 'That OTP is incorrect or has expired.'),
    );
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() =>
      expect(screen.getByText('That OTP is incorrect or has expired.')).toBeTruthy(),
    );
    expect(navigation.reset).not.toHaveBeenCalled();
  });
});
