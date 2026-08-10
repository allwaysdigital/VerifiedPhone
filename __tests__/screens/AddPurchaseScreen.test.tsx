/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AddPurchaseScreen from '../../src/screens/AddPurchaseScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import { lookupDeviceByImei } from '../../src/api/deviceLookup';

jest.mock('../../src/api/deviceLookup', () => ({
  lookupDeviceByImei: jest.fn(),
}));

const mockedLookup = lookupDeviceByImei as jest.MockedFunction<typeof lookupDeviceByImei>;

async function pickImageFor(testID: string) {
  fireEvent.press(screen.getByTestId(testID));
  fireEvent.press(screen.getByText('Choose from Gallery'));
  await waitFor(() => expect(screen.queryByText('Choose from Gallery')).toBeNull());
}

function renderScreen() {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext({
    brands: [{ id: '1', name: 'Apple' }],
  });
  render(
    <ShopDataContext.Provider value={shopData}>
      <AddPurchaseScreen navigation={navigation} route={{} as any} />
    </ShopDataContext.Provider>,
  );
  return { navigation };
}

describe('AddPurchaseScreen', () => {
  beforeEach(() => {
    mockedLookup.mockReset();
    mockedLookup.mockResolvedValue({ duplicate: false, found: false });
  });

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

    expect(navigation.navigate).toHaveBeenCalledWith(
      'DigitalSignature',
      expect.objectContaining({
        purchaseData: expect.objectContaining({
          brand: 'Apple',
          model: 'iPhone 15',
          condition: 'New',
          imei1: '123456789012345',
          purchasePrice: '50000',
          fullName: 'John Doe',
          mobileNumber: '9876543210',
        }),
      }),
    );
  });

  test('picking a photo clears the required-upload error and shows a preview', async () => {
    renderScreen();

    fireEvent.press(screen.getByText('Save'));
    expect(screen.getAllByText('This field is required')).toHaveLength(7);

    await pickImageFor('upload-phone-front');

    expect(screen.getAllByText('This field is required')).toHaveLength(6);
  });

  test('blocks Save and shows an inline error when the IMEI is already in inventory', async () => {
    mockedLookup.mockResolvedValueOnce({ duplicate: true });
    const { navigation } = renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');

    await waitFor(() =>
      expect(screen.getByText('This IMEI already exists in your inventory')).toBeTruthy(),
    );

    fireEvent.press(screen.getByText('Save'));
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  test('auto-fills and locks Brand/Model/RAM/Storage when the IMEI matches a known device', async () => {
    mockedLookup.mockResolvedValueOnce({
      duplicate: false,
      found: true,
      source: 'device-master',
      device: { brand: 'Apple', model: 'iPhone 15', ram: '6GB', storage: '128GB' },
    });
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');

    await waitFor(() => expect(screen.getByText('Edit')).toBeTruthy());
    expect(screen.getByText('Apple')).toBeTruthy();
    expect(screen.getByDisplayValue('iPhone 15')).toBeTruthy();
    expect(screen.getByDisplayValue('6GB')).toBeTruthy();
    expect(screen.getByDisplayValue('128GB')).toBeTruthy();
  });

  test('"Edit" unlocks the auto-filled device fields for manual editing', async () => {
    mockedLookup.mockResolvedValueOnce({
      duplicate: false,
      found: true,
      source: 'device-master',
      device: { brand: 'Apple', model: 'iPhone 15', ram: '6GB', storage: '128GB' },
    });
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');
    await waitFor(() => expect(screen.getByText('Edit')).toBeTruthy());

    fireEvent.press(screen.getByText('Edit'));
    expect(screen.queryByText('Edit')).toBeNull();

    fireEvent.changeText(screen.getByDisplayValue('iPhone 15'), 'iPhone 15 Pro');
    expect(screen.getByDisplayValue('iPhone 15 Pro')).toBeTruthy();
  });

  test('"Verify IMEI Online" re-triggers a lookup for the same IMEI', async () => {
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');
    await waitFor(() => expect(mockedLookup).toHaveBeenCalledTimes(1));

    fireEvent.press(screen.getByText('Verify IMEI Online'));
    await waitFor(() => expect(mockedLookup).toHaveBeenCalledTimes(2));
  });

  test('a provider timeout shows a timeout caption and does not block Save', async () => {
    mockedLookup.mockResolvedValueOnce({ duplicate: false, found: false, errorType: 'timeout' });
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');

    await waitFor(() =>
      expect(
        screen.getByText('Device lookup timed out — enter details manually below'),
      ).toBeTruthy(),
    );
    expect(screen.queryByText('Edit')).toBeNull();
  });

  test('a quota-exceeded response shows a limit-reached caption', async () => {
    mockedLookup.mockResolvedValueOnce({ duplicate: false, found: false, errorType: 'quota-exceeded' });
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');

    await waitFor(() =>
      expect(screen.getByText('Device lookup limit reached — enter details manually below')).toBeTruthy(),
    );
  });

  test('an unavailable-service response shows an unavailable caption', async () => {
    mockedLookup.mockResolvedValueOnce({ duplicate: false, found: false, errorType: 'unavailable' });
    renderScreen();

    fireEvent.changeText(screen.getByPlaceholderText('Enter 15-Digit IMEI'), '123456789012345');

    await waitFor(() =>
      expect(
        screen.getByText('Device lookup service is unavailable right now — enter details manually below'),
      ).toBeTruthy(),
    );
  });
});
