/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import { ApiError } from '../../src/api/apiError';

jest.mock('../../src/auth/session', () => ({
  sendOtp: jest.fn().mockResolvedValue('test-session-id'),
  getAuthErrorMessage: jest.requireActual('../../src/auth/session').getAuthErrorMessage,
}));

const { sendOtp } = jest.requireMock('../../src/auth/session');

function renderScreen() {
  const navigation = createMockNavigation();
  render(<LoginScreen navigation={navigation} route={{} as any} />);
  return { navigation };
}

describe('LoginScreen', () => {
  beforeEach(() => {
    sendOtp.mockClear();
    sendOtp.mockResolvedValue('test-session-id');
  });

  test('shows an error and does not navigate when the field is empty', () => {
    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText('Send OTP'));

    expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('rejects a number that is too short', () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '98765');
    fireEvent.press(screen.getByText('Send OTP'));

    expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeTruthy();
  });

  test('sends an OTP and navigates to OtpVerify with a valid number', async () => {
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() => expect(navigation.navigate).toHaveBeenCalled());

    expect(navigation.navigate).toHaveBeenCalledWith(
      'OtpVerify',
      expect.objectContaining({
        dialCode: '+91',
        phoneNumber: '9876543210',
        sessionId: 'test-session-id',
      }),
    );
  });

  test('sends the OTP with the selected country code', async () => {
    renderScreen();

    fireEvent.press(screen.getByText('+91'));
    fireEvent.press(screen.getByText('🇺🇸 USA/Canada (+1)'));
    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() => expect(sendOtp).toHaveBeenCalledWith('+1', '9876543210'));
  });

  test('shows a friendly error when the backend rejects the request', async () => {
    sendOtp.mockRejectedValueOnce(new ApiError(400, 'Enter a valid phone number.'));

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() => expect(screen.getByText('Enter a valid phone number.')).toBeTruthy());
  });
});
