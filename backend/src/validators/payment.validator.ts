import { z } from 'zod';

export const createRazorpayOrderSchema = z.object({
  orderId: z.string().trim().min(1, 'Order ID is required'),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().trim().optional(),
  razorpay_payment_id: z.string().trim().min(1, 'Razorpay Payment ID is required'),
  razorpay_order_id: z.string().trim().min(1, 'Razorpay Order ID is required'),
  razorpay_signature: z.string().trim().min(1, 'Razorpay Signature is required'),
});

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
