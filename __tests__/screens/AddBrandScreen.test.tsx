/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import AddBrandScreen from '../../src/screens/AddBrandScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';

function renderScreen(shopDataOverrides: Parameters<typeof createMockShopDataContext>[0] = {}) {
  const navigation = createMockNavigation();
  const shopData = createMockShopDataContext({
    brands: [{ id: '1', name: 'Apple' }],
    createBrand: jest.fn().mockImplementation(name => Promise.resolve({ id: '2', name })),
    ...shopDataOverrides,
  });
  render(
    <ShopDataContext.Provider value={shopData}>
      <AddBrandScreen navigation={navigation} route={{} as any} />
    </ShopDataContext.Provider>,
  );
  return { navigation, shopData };
}

describe('AddBrandScreen', () => {
  test('does not navigate when the field is left empty', () => {
    const { navigation } = renderScreen();
    fireEvent.press(screen.getAllByText('Add Brand')[1]);
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  test('shows a duplicate error for a brand that already exists', () => {
    const { navigation, shopData } = renderScreen();
    const input = screen.getByPlaceholderText('Enter Brand Name');

    fireEvent.changeText(input, 'Apple');
    fireEvent.press(screen.getAllByText('Add Brand')[1]);

    expect(screen.getByText('This brand is already added')).toBeTruthy();
    expect(shopData.createBrand).not.toHaveBeenCalled();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  test('adds a new brand and navigates back', async () => {
    const { navigation, shopData } = renderScreen();
    const input = screen.getByPlaceholderText('Enter Brand Name');

    fireEvent.changeText(input, 'Test Brand XYZ');
    fireEvent.press(screen.getAllByText('Add Brand')[1]);

    await waitFor(() => expect(shopData.createBrand).toHaveBeenCalledWith('Test Brand XYZ'));
    await waitFor(() => expect(navigation.goBack).toHaveBeenCalledTimes(1));
  });

  test('clears the error once the user edits the field again', () => {
    renderScreen();
    const input = screen.getByPlaceholderText('Enter Brand Name');

    fireEvent.changeText(input, 'Apple');
    fireEvent.press(screen.getAllByText('Add Brand')[1]);
    expect(screen.getByText('This brand is already added')).toBeTruthy();

    fireEvent.changeText(input, 'Apple Two');
    expect(screen.queryByText('This brand is already added')).toBeNull();
  });
});
