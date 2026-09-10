module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-firebase)?|@react-navigation|react-native-.*)/)',
  ],
  moduleNameMapper: {
    '^react-native($|/.*)': '<rootDir>/node_modules/react-native/$1',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
  },
};
