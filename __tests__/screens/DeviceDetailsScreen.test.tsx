/**
 * @format
 */

import React from 'react';
import { Alert, StyleSheet } from 'react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import DeviceDetailsScreen from '../../src/screens/DeviceDetailsScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { savePdfToDownloads } from '../../src/native/downloads';
import { colors } from '../../src/theme/colors';
import type { Device } from '../../src/types/domain';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import { makeDevice, makeSoldDevice } from '../../test-utils/mockDevice';

jest.mock('../../src/native/downloads', () => ({
  savePdfToDownloads: jest.fn().mockResolvedValue(undefined),
}));

const SHOP = {
  id: 'shop-1',
  shopName: 'Maksud Collection',
  gstNumber: '',
  address: 'Ahmedabad',
  contactNumber: '9737218881',
  logoUrl: null,
  profileCompleted: true,
};

function renderScreen(device: Device) {
  const navigation = createMockNavigation();
  render(
    <ShopDataContext.Provider value={createMockShopDataContext({ shop: SHOP, devices: [device] })}>
      <DeviceDetailsScreen
        navigation={navigation}
        route={{ key: 'DeviceDetails', name: 'DeviceDetails', params: { deviceId: device.id } } as any}
      />
    </ShopDataContext.Provider>,
  );
  return { navigation };
}

const profitColor = (text: RegExp) => StyleSheet.flatten(screen.getByText(text).props.style).color;

beforeEach(() => jest.clearAllMocks());

describe('VP-10 · profit colour', () => {
  test('positive profit is green, not red', () => {
    renderScreen(makeSoldDevice());
    expect(profitColor(/₹1,500 \(/)).toBe(colors.greenDark);
  });

  test('a loss is red and shows a minus sign', () => {
    renderScreen(makeSoldDevice({ profit: -500, profitPercent: -6.25 }));
    expect(profitColor(/-₹500/)).toBe(colors.danger);
  });

  test('zero profit is neutral', () => {
    renderScreen(makeSoldDevice({ profit: 0, profitPercent: 0 }));
    expect(profitColor(/₹0 \(/)).toBe(colors.textMuted);
  });
});

describe('VP-11 · View Invoice', () => {
  test('the button says "View Invoice" and opens the invoice preview', () => {
    const { navigation } = renderScreen(makeSoldDevice());
    expect(screen.queryByText('Download Invoice')).toBeNull();
    fireEvent.press(screen.getByText('View Invoice'));
    expect(navigation.navigate).toHaveBeenCalledWith(
      'InvoicePreview',
      expect.objectContaining({ deviceId: 'device-1', salePrice: 9500 }),
    );
  });
});

describe('VP-04 · Export Consent Letter and View Documents', () => {
  test('Export Consent Letter creates a PDF and saves it to Downloads', async () => {
    renderScreen(makeDevice());
    fireEvent.press(screen.getByText('Export Consent Letter'));
    await waitFor(() =>
      expect(savePdfToDownloads).toHaveBeenCalledWith(
        '/mock/invoice.pdf',
        'ConsentLetter-356938035643809',
        'Consent letter downloaded',
      ),
    );
    const html = (generatePDF as jest.Mock).mock.calls[0][0].html as string;
    expect(html).toContain('Seller Consent');
    expect(html).toContain('Test Seller');
  });

  test('View Documents tells the user when nothing was uploaded', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    renderScreen(makeDevice());
    fireEvent.press(screen.getByText('View Documents'));
    expect(alert).toHaveBeenCalledWith('No documents', expect.any(String));
  });

  test('View Documents opens a gallery of every uploaded document', () => {
    renderScreen(
      makeDevice({ aadhaarFrontUrl: 'https://x/front.jpg', aadhaarBackUrl: 'https://x/back.jpg' }),
    );
    fireEvent.press(screen.getByText('View Documents'));
    expect(screen.getByText('Aadhaar Front · 1 of 2')).toBeTruthy();
    fireEvent.press(screen.getByText('Close'));
    expect(screen.queryByText('Aadhaar Front · 1 of 2')).toBeNull();
  });
});
