import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { OrderService } from '../services/order.service';
import { CheckoutController } from './checkout.controller';
import {
  orderIdParamSchema,
  updateOrderStatusSchema,
  adminOrderQuerySchema,
} from '../validators/order.validator';

export class OrderController {
  /**
   * Alias to CheckoutController.executeCheckout for POST /api/v1/orders (Customer).
   * POST /api/v1/orders
   */
  static createOrder = CheckoutController.executeCheckout;

  /**
   * Retrieves customer order history (Customer).
   * GET /api/v1/orders
   */
  static getCustomerOrders = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await OrderService.getCustomerOrders(userId, req.query as any);

    return ApiResponse.paginated(res, 'Orders retrieved successfully', result.orders, result.pagination);
  });

  /**
   * Retrieves specific customer order details (Customer).
   * GET /api/v1/orders/:id
   */
  static getCustomerOrderById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = orderIdParamSchema.parse(req.params);
    const order = await OrderService.getCustomerOrderById(userId, id);

    return ApiResponse.success(res, 'Order details retrieved successfully', order);
  });

  /**
   * Customer cancels an order (Customer).
   * PATCH /api/v1/orders/:id/cancel
   */
  static cancelCustomerOrder = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = orderIdParamSchema.parse(req.params);
    const order = await OrderService.cancelCustomerOrder(userId, id);

    return ApiResponse.success(res, 'Order cancelled successfully', order);
  });

  /**
   * Admin retrieves paginated orders list (Admin / Staff).
   * GET /api/v1/admin/orders
   */
  static getAdminOrders = asyncHandler(async (req: Request, res: Response) => {
    const query = adminOrderQuerySchema.parse(req.query);
    const result = await OrderService.getAdminOrders(query);

    return ApiResponse.paginated(res, 'Admin orders list retrieved successfully', result.orders, result.pagination);
  });

  /**
   * Admin updates order status (Admin / Staff).
   * PATCH /api/v1/admin/orders/:id/status
   */
  static updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = orderIdParamSchema.parse(req.params);
    const { status } = updateOrderStatusSchema.parse(req.body);
    const order = await OrderService.updateOrderStatus(id, status);

    return ApiResponse.success(res, 'Order status updated successfully', order);
  });
}
