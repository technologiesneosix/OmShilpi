import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { PaymentService } from '../services/payment.service';
import { createRazorpayOrderSchema, verifyPaymentSchema } from '../validators/payment.validator';

export class PaymentController {
  /**
   * Creates or retrieves Razorpay Order for internal Order (Customer).
   * POST /api/v1/payments/create-order
   */
  static createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input = createRazorpayOrderSchema.parse(req.body);
    const result = await PaymentService.createRazorpayOrder(userId, input);

    return ApiResponse.success(res, 'Razorpay order created successfully', result, 201);
  });

  /**
   * Verifies Razorpay payment signature server-side (Customer).
   * POST /api/v1/payments/verify
   */
  static verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input = verifyPaymentSchema.parse(req.body);
    const result = await PaymentService.verifyPayment(userId, input);

    return ApiResponse.success(res, 'Payment verified successfully', result);
  });

  /**
   * Handles incoming Razorpay raw-body Webhook notifications (Public).
   * POST /api/v1/payments/webhook/razorpay
   */
  static handleWebhook = asyncHandler(async (req: Request, res: Response) => {
    const rawBodyBuffer = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

    const signatureHeader = req.headers['x-razorpay-signature'] as string | undefined;
    const eventIdHeader = req.headers['x-razorpay-event-id'] as string | undefined;

    const result = await PaymentService.handleWebhook(rawBodyBuffer, signatureHeader, eventIdHeader);

    return ApiResponse.success(res, 'Webhook processed successfully', result);
  });
}
