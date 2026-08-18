import express, { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { paymentRateLimiter } from '../middleware/rateLimiter.middleware';
import { PaymentController } from '../controllers/payment.controller';

const router = Router();

/**
 * @route POST /api/v1/payments/webhook/razorpay
 * @desc Razorpay Webhook endpoint (Requires raw body before JSON middleware)
 * @access Public
 */
router.post(
  '/webhook/razorpay',
  express.raw({ type: 'application/json' }),
  PaymentController.handleWebhook
);

// Protected Payment Routes (Authenticated Users)
router.use(requireAuth);

/**
 * @route POST /api/v1/payments/create-order
 * @desc Create or retrieve Razorpay Order for an existing internal Order
 * @access Customer
 */
router.post('/create-order', PaymentController.createRazorpayOrder);

/**
 * @route POST /api/v1/payments/verify
 * @desc Verify Razorpay payment signature server-side using Key Secret
 * @access Customer
 */
router.post('/verify', paymentRateLimiter, PaymentController.verifyPayment);

export default router;
