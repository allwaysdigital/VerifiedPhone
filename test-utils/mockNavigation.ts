export function createMockNavigation(overrides: Record<string, unknown> = {}) {
  const navigation: any = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
    replace: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
    ...overrides,
  };
  navigation.getParent = jest.fn(() => navigation);
  return navigation;
}
