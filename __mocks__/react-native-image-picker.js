const mockAsset = { uri: 'file:///mock/photo.jpg' };

module.exports = {
  launchCamera: jest.fn().mockResolvedValue({ assets: [mockAsset] }),
  launchImageLibrary: jest.fn().mockResolvedValue({ assets: [mockAsset] }),
};
