import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';

// Load .env file explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('❌ Missing Razorpay API keys: Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file.');
}

export const RAZORPAY_KEY_ID: string = process.env.RAZORPAY_KEY_ID;
export const RAZORPAY_KEY_SECRET: string = process.env.RAZORPAY_KEY_SECRET;
export const RAZORPAY_WEBHOOK_SECRET: string = process.env.RAZORPAY_WEBHOOK_SECRET || 'mockwebhooksecret1234567890';
export const RAZORPAY_CURRENCY: string = process.env.RAZORPAY_CURRENCY || 'INR';

export const isRazorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);

export const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});


