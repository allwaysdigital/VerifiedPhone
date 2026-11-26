/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import InvoicePreviewScreen from '../../src/screens/InvoicePreviewScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { savePdfToDownloads } from '../../src/native/downloads';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';
import { makeSoldDevice } from '../../test-utils/mockDevice';

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

const PARAMS = {
  deviceId: 'device-1',
  customerName: 'Test Buyer',
  customerMobile: '9999900002',
  customerAddress: 'Test Address',
  salePrice: 9500,
  warrantyPeriod: '3 months',
};

function renderScreen(device = makeSoldDevice()) {
  const ui = (
    <ShopDataContext.Provider value={createMockShopDataContext({ shop: SHOP, devices: [device] })}>
      <InvoicePreviewScreen
        navigation={createMockNavigation()}
        route={{ key: 'InvoicePreview', name: 'InvoicePreview', params: PARAMS } as any}
      />
    </ShopDataContext.Provider>
  );
  return render(ui);
}

beforeEach(() => jest.clearAllMocks());

describe('VP-01 · invoice shows the shop’s own details', () => {
  test('shows the saved address and contact and no placeholder details', () => {
    renderScreen();
    expect(screen.getAllByText('Maksud Collection').length).toBeGreaterThan(0);
    expect(screen.getByText(/Ahmedabad/)).toBeTruthy();
    expect(screen.getByText(/9737218881/)).toBeTruthy();
    expect(screen.queryByText(/123 Main Street/)).toBeNull();
    expect(screen.queryByText(/98765 43210/)).toBeNull();
    expect(screen.queryByText(/GST:/)).toBeNull();
  });
});

describe('VP-02 · invoice number is stable', () => {
  test('shows the number saved with the sale, the same on every view', () => {
    const first = renderScreen();
    expect(screen.getByText(/MC\/2026-27\/0001/)).toBeTruthy();
    first.unmount();
    renderScreen();
    expect(screen.getByText(/MC\/2026-27\/0001/)).toBeTruthy();
  });

  test('the PDF uses the same number and a safe file name', async () => {
    renderScreen();
    fireEvent.press(screen.getByText(/Download/i));
    await waitFor(() => expect(savePdfToDownloads).toHaveBeenCalled());
    const { html, fileName } = (generatePDF as jest.Mock).mock.calls[0][0];
    expect(html).toContain('MC/2026-27/0001');
    expect(fileName).toBe('Invoice-MC-2026-27-0001');
  });
});

describe('VP-11 · Download saves the PDF to Downloads', () => {
  test('saves to Downloads instead of opening the share sheet', async () => {
    renderScreen();
    fireEvent.press(screen.getByText(/Download/i));
    await waitFor(() =>
      expect(savePdfToDownloads).toHaveBeenCalledWith(
        '/mock/invoice.pdf',
        'Invoice-MC-2026-27-0001',
        'Invoice downloaded',
      ),
    );
    expect(Share.open).not.toHaveBeenCalled();
  });
});
