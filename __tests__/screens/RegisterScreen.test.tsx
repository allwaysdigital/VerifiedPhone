/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import RegisterScreen from '../../src/screens/RegisterScreen';
import CompleteProfileScreen from '../../src/screens/CompleteProfileScreen';
import { ShopDataContext } from '../../src/context/ShopDataContext';
import { createMockShopDataContext } from '../../test-utils/mockShopData';
import { createMockNavigation } from '../../test-utils/mockNavigation';

const SCREENS: [string, React.ComponentType<any>][] = [
  ['Register', RegisterScreen],
  ['Complete Profile', CompleteProfileScreen],
];

describe.each(SCREENS)('VP-14 · %s shop form', (_name, Screen) => {
  function renderScreen() {
    const navigation = createMockNavigation();
    render(
      <ShopDataContext.Provider value={createMockShopDataContext()}>
        <Screen navigation={navigation} route={{ params: {} } as any} />
      </ShopDataContext.Provider>,
    );
    return { navigation };
  }

  test('Shop Name starts empty, with "e.g. Mobile Hub" only as a hint', () => {
    renderScreen();
    const shopName = screen.getByPlaceholderText('e.g. Mobile Hub');
    expect(shopName.props.value).toBe('');
    expect(screen.queryByDisplayValue('Mobile Hub')).toBeNull();
  });

  test('GST is marked optional and not required', () => {
    const { navigation } = renderScreen();
    expect(screen.getByText('GST Number (optional)')).toBeTruthy();
    fireEvent.press(screen.getByText(/^Save (Shop Details|& Continue)$/));
    // Shop Name and Address are required; GST is not, so only two errors show.
    expect(screen.getAllByText('This field is required')).toHaveLength(2);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });
});
