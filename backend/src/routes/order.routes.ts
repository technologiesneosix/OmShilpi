import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { OrderController } from '../controllers/order.controller';

const orderCustomerRouter = Router();
const orderAdminRouter = Router();

// ===================================================
// CUSTOMER ORDER ROUTES (Authenticated Users)
// ===================================================
orderCustomerRouter.use(requireAuth);

/**
 * @route POST /api/v1/orders
 * @desc Create order from customer cart (Checkout execution)
 * @access Customer
 */
orderCustomerRouter.post('/', OrderController.createOrder);

/**
 * @route GET /api/v1/orders
 * @desc Get authenticated user's order history
 * @access Customer, Admin, Staff
 */
orderCustomerRouter.get('/', OrderController.getCustomerOrders);

/**
 * @route GET /api/v1/orders/:id
 * @desc Get specific authenticated user's order details
 * @access Customer, Admin, Staff
 */
orderCustomerRouter.get('/:id', OrderController.getCustomerOrderById);

/**
 * @route PATCH /api/v1/orders/:id/cancel
 * @desc Customer cancel PENDING/CONFIRMED order
 * @access Customer
 */
orderCustomerRouter.patch('/:id/cancel', OrderController.cancelCustomerOrder);

// ===================================================
// ADMIN ORDER MANAGEMENT ROUTES (Admin, Staff, Super Admin)
// ===================================================
orderAdminRouter.use(requireAuth, requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

/**
 * @route GET /api/v1/admin/orders
 * @desc Admin list all orders with pagination & status filters
 * @access Admin, Staff, Super Admin
 */
orderAdminRouter.get('/', OrderController.getAdminOrders);

/**
 * @route GET /api/v1/admin/orders/:id
 * @desc Admin get specific order details with full customer & shipping snapshot
 * @access Admin, Staff, Super Admin
 */
orderAdminRouter.get('/:id', OrderController.getAdminOrderById);

/**
 * @route PATCH /api/v1/admin/orders/:id/status
 * @desc Admin update order status with transition validation
 * @access Admin, Staff, Super Admin
 */
orderAdminRouter.patch('/:id/status', OrderController.updateOrderStatus);

export {
  orderCustomerRouter,
  orderAdminRouter,
};
