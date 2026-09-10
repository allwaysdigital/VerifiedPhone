/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import LoginScreen from '../../src/screens/LoginScreen';
import { createMockNavigation } from '../../test-utils/mockNavigation';

function renderScreen() {
  const navigation = createMockNavigation();
  render(<LoginScreen navigation={navigation} route={{} as any} />);
  return { navigation };
}

describe('LoginScreen', () => {
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

  test('sends an OTP via Firebase and navigates to OtpVerify with a valid number', async () => {
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() => expect(navigation.navigate).toHaveBeenCalled());

    expect(navigation.navigate).toHaveBeenCalledWith(
      'OtpVerify',
      expect.objectContaining({ dialCode: '+91', phoneNumber: '9876543210' }),
    );
  });

  test('sends the OTP with the selected country code', async () => {
    const authModule = require('@react-native-firebase/auth');
    renderScreen();

    fireEvent.press(screen.getByText('+91'));
    fireEvent.press(screen.getByText('🇺🇸 USA/Canada (+1)'));
    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() =>
      expect(authModule.signInWithPhoneNumber).toHaveBeenCalledWith(
        expect.anything(),
        '+19876543210',
      ),
    );
  });

  test('shows a friendly error when Firebase rejects the phone number', async () => {
    const authModule = require('@react-native-firebase/auth');
    authModule.signInWithPhoneNumber.mockRejectedValueOnce({
      code: 'auth/invalid-phone-number',
    });

    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    await waitFor(() =>
      expect(screen.getByText('Enter a valid 10-digit mobile number.')).toBeTruthy(),
    );
  });
});
