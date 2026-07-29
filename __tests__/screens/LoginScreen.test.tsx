/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
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

  test('navigates to OtpVerify with a valid 10-digit number', () => {
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Mobile Number.'), '9876543210');
    fireEvent.press(screen.getByText('Send OTP'));

    expect(navigation.navigate).toHaveBeenCalledWith('OtpVerify', {
      phoneNumber: '9876543210',
    });
  });
});
