import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { CheckoutService } from '../services/checkout.service';
import { checkoutPreviewSchema, checkoutSchema } from '../validators/checkout.validator';

export class CheckoutController {
  /**
   * Generates checkout preview summary (Customer).
   * POST /api/v1/checkout/preview or GET /api/v1/checkout/preview
   */
  static getCheckoutPreview = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const bodyInput = req.method === 'POST' ? req.body : {};
    const input = checkoutPreviewSchema.parse(bodyInput);
    const preview = await CheckoutService.getCheckoutPreview(userId, input);

    return ApiResponse.success(res, 'Checkout preview generated successfully', preview);
  });

  /**
   * Executes final checkout converting cart to Order (Customer).
   * POST /api/v1/checkout
   */
  static executeCheckout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input = checkoutSchema.parse(req.body);
    const idempotencyKey = (req.headers['idempotency-key'] || req.headers['x-idempotency-key']) as string | undefined;
    const order = await CheckoutService.executeCheckout(userId, input, idempotencyKey);

    return ApiResponse.success(res, 'Order created successfully', order, 201);
  });
}
