/* eslint-env jest */
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  const { useEffect } = require('react');
  return {
    ...actualNav,
    useFocusEffect: callback => {
      useEffect(() => callback(), [callback]);
    },
    // Screens using useDisableBackNavigation() call this directly (outside
    // any navigation prop passed in by a test) — stub it so those screens
    // don't need a real NavigationContainer just to render in a test.
    useNavigation: () => ({ setOptions: jest.fn() }),
  };
});
