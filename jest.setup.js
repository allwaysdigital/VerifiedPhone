/* eslint-env jest */
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const { useEffect } = require('react');
  return {
    ...actualNav,
    useFocusEffect: callback => {
      useEffect(() => callback(), [callback]);
    },
  };
});
