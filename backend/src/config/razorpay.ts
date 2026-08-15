import Razorpay from 'razorpay';

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid12345';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mockkeysecret1234567890abcdef';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'mockwebhooksecret1234567890';
export const RAZORPAY_CURRENCY = process.env.RAZORPAY_CURRENCY || 'INR';

export const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
);

export const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});
