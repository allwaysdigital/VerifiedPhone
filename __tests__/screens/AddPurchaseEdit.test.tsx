/**
 * @format
 */

import React from 'react';
import { ToastAndroid } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AddPurchaseScreen from '../../src/screens/AddPurchaseScreen';
import DeviceDetailsScreen from '../../src/screens/DeviceDetailsScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import { makeDevice } from '../../test-utils/mockDevice';

jest.mock('../../src/native/downloads', () => ({ savePdfToDownloads: jest.fn() }));

const DEVICE = makeDevice({
  imei1: '356938035643809',
  batteryHealth: 90,
  expectedSalePrice: 9500,
  accessories: ['Charger', 'Box'],
  phoneFrontImageUrl: 'https://cdn.example/front.jpg',
  aadhaarFrontUrl: 'https://cdn.example/aadhaar-front.jpg',
  aadhaarBackUrl: 'https://cdn.example/aadhaar-back.jpg',
});

function renderAddPurchase(params?: { deviceId?: string }) {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext({
    brands: [{ id: '1', name: 'Samsung' }],
    devices: [DEVICE],
    updateDevice: jest.fn().mockResolvedValue(DEVICE),
  });
  render(
    <ShopDataContext.Provider value={shopData}>
      <AddPurchaseScreen
        navigation={navigation}
        route={{ key: 'AddPurchase', name: 'AddPurchase', params } as any}
      />
    </ShopDataContext.Provider>,
  );
  return { navigation, shopData };
}

beforeEach(() => jest.clearAllMocks());

describe('VP-15 · Add Purchase section titles', () => {
  test('uses distinct titles that match their contents', () => {
    renderAddPurchase();
    expect(screen.getByText('Price & Accessories')).toBeTruthy();
    expect(screen.getByText('Seller Details')).toBeTruthy();
    expect(screen.getByText('Photos & Documents')).toBeTruthy();
    expect(screen.queryByText('Purchase Details')).toBeNull();
    expect(screen.queryByText('Personal Information')).toBeNull();
  });
});

describe('VP-17 · editing a purchase', () => {
  test('the pencil on Device Details opens the purchase for editing', () => {
    const navigation = createMockNavigation();
    render(
      <ShopDataContext.Provider value={createMockShopDataContext({ devices: [DEVICE] })}>
        <DeviceDetailsScreen
          navigation={navigation}
          route={{ key: 'DeviceDetails', name: 'DeviceDetails', params: { deviceId: DEVICE.id } } as any}
        />
      </ShopDataContext.Provider>,
    );
    fireEvent.press(screen.getByLabelText('Edit purchase'));
    expect(navigation.navigate).toHaveBeenCalledWith('AddPurchase', { deviceId: DEVICE.id });
  });

  test('the form opens as "Edit Purchase" with every field filled in', () => {
    renderAddPurchase({ deviceId: DEVICE.id });
    expect(screen.getByText('Edit Purchase')).toBeTruthy();
    expect(screen.getByDisplayValue('Galaxy A52')).toBeTruthy();
    expect(screen.getByDisplayValue('356938035643809')).toBeTruthy();
    expect(screen.getByDisplayValue('8000')).toBeTruthy();
    expect(screen.getByDisplayValue('9500')).toBeTruthy();
    expect(screen.getByDisplayValue('90')).toBeTruthy();
    expect(screen.getByDisplayValue('Test Seller')).toBeTruthy();
    expect(screen.getByDisplayValue('9999900001')).toBeTruthy();
  });

  test('saving updates the phone directly, without asking for the signature again', async () => {
    const toast = jest.spyOn(ToastAndroid, 'show').mockImplementation(() => {});
    const { navigation, shopData } = renderAddPurchase({ deviceId: DEVICE.id });

    fireEvent.changeText(screen.getByDisplayValue('8000'), '7500');
    fireEvent.press(screen.getByText('Save'));

    await waitFor(() => expect(shopData.updateDevice).toHaveBeenCalled());
    const [id, input] = (shopData.updateDevice as jest.Mock).mock.calls[0];
    expect(id).toBe(DEVICE.id);
    expect(input).toEqual(
      expect.objectContaining({
        brand: 'Samsung',
        model: 'Galaxy A52',
        purchasePrice: '7500',
        expectedSalePrice: '9500',
        accessories: ['Charger', 'Box'],
        sellerName: 'Test Seller',
        // Unchanged photos keep their stored URLs (the API skips re-uploading them).
        phoneFrontImageUri: 'https://cdn.example/front.jpg',
        aadhaarFrontUri: 'https://cdn.example/aadhaar-front.jpg',
      }),
    );
    expect(navigation.navigate).not.toHaveBeenCalledWith('DigitalSignature', expect.anything());
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalled());
    expect(toast).toHaveBeenCalledWith('Purchase updated', expect.any(Number));
  });

  test('a failed save keeps the form open and says what happened', async () => {
    const { navigation, shopData } = renderAddPurchase({ deviceId: DEVICE.id });
    (shopData.updateDevice as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    fireEvent.press(screen.getByText('Save'));
    expect(await screen.findByText(/Could not save your changes/)).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });
});

describe('VP-07 · photos are shrunk before upload', () => {
  test('the picker asks for a resized, compressed photo', async () => {
    renderAddPurchase();
    fireEvent.press(screen.getByTestId('upload-phone-front'));
    fireEvent.press(screen.getByText('Choose from Gallery'));
    await waitFor(() => expect(launchImageLibrary).toHaveBeenCalled());
    expect(launchImageLibrary).toHaveBeenCalledWith(
      expect.objectContaining({ maxWidth: 1600, maxHeight: 1600, quality: 0.7 }),
    );
  });
});
