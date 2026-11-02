const RazorpayCheckout = {
  open: jest.fn().mockResolvedValue({
    razorpay_payment_id: 'pay_test',
    razorpay_subscription_id: 'sub_test',
    razorpay_signature: 'sig_test',
  }),
};

module.exports = RazorpayCheckout;
module.exports.default = RazorpayCheckout;
