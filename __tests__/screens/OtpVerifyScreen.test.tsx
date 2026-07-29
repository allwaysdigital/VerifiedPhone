/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import OtpVerifyScreen from '../../src/screens/OtpVerifyScreen';
import { createMockNavigation } from '../../test-utils/mockNavigation';

function renderScreen() {
  const navigation = createMockNavigation();
  render(
    <OtpVerifyScreen
      navigation={navigation}
      route={{ params: { phoneNumber: '9876543210' } } as any}
    />,
  );
  return { navigation };
}

describe('OtpVerifyScreen', () => {
  test('shows an error and does not log in when the OTP is empty', () => {
    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('Enter the 6-digit OTP')).toBeTruthy();
    expect(navigation.reset).not.toHaveBeenCalled();
  });

  test('rejects an OTP shorter than 6 digits', () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '1234');
    fireEvent.press(screen.getByText('Verify'));

    expect(screen.getByText('Enter the 6-digit OTP')).toBeTruthy();
  });

  test('logs in and resets to MainTabs with a valid 6-digit OTP', async () => {
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('OTP'), '123456');
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() =>
      expect(navigation.reset).toHaveBeenCalledWith({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      }),
    );
  });
});
