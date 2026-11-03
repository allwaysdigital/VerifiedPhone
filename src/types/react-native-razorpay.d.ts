// The package ships no .d.ts (see its README) — this covers only the shape
// this app actually uses (subscription checkout), not the full SDK surface.
declare module 'react-native-razorpay' {
  type CheckoutOptions = {
    key: string;
    subscription_id?: string;
    order_id?: string;
    name?: string;
    description?: string;
    image?: string;
    currency?: string;
    amount?: number;
    theme?: { color?: string };
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    [key: string]: unknown;
  };

  type CheckoutSuccess = {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  };

  type CheckoutError = {
    code: number;
    description: string;
  };

  const RazorpayCheckout: {
    open(options: CheckoutOptions): Promise<CheckoutSuccess>;
  };

  export default RazorpayCheckout;
}
