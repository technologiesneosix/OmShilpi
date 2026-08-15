import express, { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
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

// Protected Customer Routes
router.use(requireAuth, requireRole('CUSTOMER'));

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
router.post('/verify', PaymentController.verifyPayment);

export default router;
