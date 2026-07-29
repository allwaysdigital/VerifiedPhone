/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AddPurchaseScreen from '../../src/screens/AddPurchaseScreen';
import { createMockNavigation } from '../../test-utils/mockNavigation';

async function pickImageFor(testID: string) {
  fireEvent.press(screen.getByTestId(testID));
  fireEvent.press(screen.getByText('Choose from Gallery'));
  await waitFor(() => expect(screen.queryByText('Choose from Gallery')).toBeNull());
}

function renderScreen() {
  const navigation = createMockNavigation();
  render(<AddPurchaseScreen navigation={navigation} route={{} as any} />);
  return { navigation };
}

describe('AddPurchaseScreen', () => {
  test('shows every required/format error and does not navigate when submitted empty', () => {
    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText('Save'));

    // Brand, Model, Condition, Full Name, Phone Front Image, Aadhaar Front, Aadhaar Back
    expect(screen.getAllByText('This field is required')).toHaveLength(7);
    expect(screen.getByText('Enter a valid 15-digit IMEI number')).toBeTruthy();
    expect(screen.getByText('Enter a valid amount greater than 0')).toBeTruthy();
    expect(screen.getByText('Enter a valid 10-digit mobile number')).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('flags an out-of-range battery health without touching required fields', () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('e.g., 85'), '150');
    fireEvent.press(screen.getByText('Save'));

    expect(screen.getByText('Enter a value between 0 and 100')).toBeTruthy();
  });

  test('clears the model error as soon as the user types', () => {
    renderScreen();

    fireEvent.press(screen.getByText('Save'));
    expect(screen.getAllByText('This field is required').length).toBeGreaterThan(0);

    fireEvent.changeText(screen.getByPlaceholderText('Enter Model Name'), 'iPhone 15');
    // one fewer "required" error now that Model is filled in
    const remaining = screen.getAllByText('This field is required');
    expect(remaining).toHaveLength(6);
  });

  test('submits and navigates to DigitalSignature once every required field is valid', async () => {
    const { navigation } = renderScreen();

    fireEvent.press(screen.getByText('Select Brand'));
    fireEvent.press(screen.getByText('Apple'));
    fireEvent.changeText(screen.getByPlaceholderText('Enter Model Name'), 'iPhone 15');
    fireEvent.press(screen.getByText('Select Condition'));
    fireEvent.press(screen.getByText('New'));
    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');
    fireEvent.changeText(screen.getByPlaceholderText('Enter  Purchase Price'), '50000');
    fireEvent.changeText(screen.getByPlaceholderText('Enter full name'), 'John Doe');
    fireEvent.changeText(screen.getByPlaceholderText('Enter 10-digit mobile'), '9876543210');

    await pickImageFor('upload-phone-front');
    await pickImageFor('upload-aadhaar-front');
    await pickImageFor('upload-aadhaar-back');

    fireEvent.press(screen.getByText('Save'));

    expect(navigation.navigate).toHaveBeenCalledWith('DigitalSignature');
  });

  test('picking a photo clears the required-upload error and shows a preview', async () => {
    renderScreen();

    fireEvent.press(screen.getByText('Save'));
    expect(screen.getAllByText('This field is required')).toHaveLength(7);

    await pickImageFor('upload-phone-front');

    expect(screen.getAllByText('This field is required')).toHaveLength(6);
  });
});
