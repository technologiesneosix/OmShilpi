import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { OrderService } from '../services/order.service';
import { CheckoutController } from './checkout.controller';
import {
  orderIdParamSchema,
  updateOrderStatusSchema,
  adminOrderQuerySchema,
  customerOrderQuerySchema,
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
    const query = customerOrderQuerySchema.parse(req.query);
    const result = await OrderService.getCustomerOrders(userId, query);

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
   * Admin retrieves specific order details (Admin / Staff).
   * GET /api/v1/admin/orders/:id
   */
  static getAdminOrderById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = orderIdParamSchema.parse(req.params);
    const order = await OrderService.getAdminOrderById(id);

    return ApiResponse.success(res, 'Admin order details retrieved successfully', order);
  });

  /**
   * Admin updates order status (Admin / Staff).
   * PATCH /api/v1/admin/orders/:id/status
   */
  static updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const adminId = req.user!.id;
    const { id } = orderIdParamSchema.parse(req.params);
    const { status } = updateOrderStatusSchema.parse(req.body);
    const order = await OrderService.updateOrderStatus(id, status, adminId);

    return ApiResponse.success(res, 'Order status updated successfully', order);
  });
}
