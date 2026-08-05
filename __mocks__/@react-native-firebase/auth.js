const mockConfirmationResult = {
  verificationId: 'mock-verification-id',
  confirm: jest.fn().mockResolvedValue({ user: { uid: 'mock-uid' } }),
};

module.exports = {
  getAuth: jest.fn(() => ({
    currentUser: { getIdToken: jest.fn().mockResolvedValue('mock-id-token') },
  })),
  onAuthStateChanged: jest.fn((_auth, callback) => {
    callback(null);
    return jest.fn();
  }),
  signInWithPhoneNumber: jest.fn().mockResolvedValue(mockConfirmationResult),
  signOut: jest.fn().mockResolvedValue(undefined),
  __mockConfirmationResult: mockConfirmationResult,
};
