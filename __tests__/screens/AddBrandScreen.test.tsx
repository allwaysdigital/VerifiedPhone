/**
 * @format
 */

import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import AddBrandScreen from '../../src/screens/AddBrandScreen';
import { brandExists } from '../../src/data/brands';
import { createMockNavigation } from '../../test-utils/mockNavigation';

function renderScreen() {
  const navigation = createMockNavigation();
  render(<AddBrandScreen navigation={navigation} route={{} as any} />);
  return { navigation };
}

describe('AddBrandScreen', () => {
  test('does not navigate when the field is left empty', () => {
    const { navigation } = renderScreen();
    fireEvent.press(screen.getAllByText('Add Brand')[1]);
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  test('shows a duplicate error for a brand that already exists', () => {
    const { navigation } = renderScreen();
    const input = screen.getByPlaceholderText('Enter Brand Name');

    fireEvent.changeText(input, 'Apple');
    fireEvent.press(screen.getAllByText('Add Brand')[1]);

    expect(screen.getByText('This brand is already added')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  test('adds a new brand and navigates back', () => {
    const { navigation } = renderScreen();
    const input = screen.getByPlaceholderText('Enter Brand Name');

    expect(brandExists('Test Brand XYZ')).toBe(false);

    fireEvent.changeText(input, 'Test Brand XYZ');
    fireEvent.press(screen.getAllByText('Add Brand')[1]);

    expect(brandExists('Test Brand XYZ')).toBe(true);
    expect(navigation.goBack).toHaveBeenCalledTimes(1);
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
