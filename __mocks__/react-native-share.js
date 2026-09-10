const Social = {
  Whatsapp: 'whatsapp',
};

const Share = {
  open: jest.fn().mockResolvedValue({ success: true, message: '' }),
  shareSingle: jest.fn().mockResolvedValue({ success: true, message: '' }),
  Social,
};

module.exports = Share;
module.exports.Social = Social;
module.exports.default = Share;
