import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { OrderController } from '../controllers/order.controller';

const checkoutRouter = Router();
const orderCustomerRouter = Router();
const orderAdminRouter = Router();

// ===================================================
// CHECKOUT ROUTES (Customer)
// ===================================================
checkoutRouter.use(requireAuth, requireRole('CUSTOMER'));

/**
 * @route POST /api/v1/checkout/preview
 * @desc Get checkout preview summary with calculated totals and stock availability
 * @access Customer
 */
checkoutRouter.post('/preview', OrderController.getCheckoutPreview);

// ===================================================
// CUSTOMER ORDER ROUTES
// ===================================================
orderCustomerRouter.use(requireAuth, requireRole('CUSTOMER'));

/**
 * @route POST /api/v1/orders
 * @desc Create order from customer cart
 * @access Customer
 */
orderCustomerRouter.post('/', OrderController.createOrder);

/**
 * @route GET /api/v1/orders
 * @desc Get customer order history
 * @access Customer
 */
orderCustomerRouter.get('/', OrderController.getCustomerOrders);

/**
 * @route GET /api/v1/orders/:id
 * @desc Get specific customer order details
 * @access Customer
 */
orderCustomerRouter.get('/:id', OrderController.getCustomerOrderById);

/**
 * @route PATCH /api/v1/orders/:id/cancel
 * @desc Customer cancel PENDING/CONFIRMED order
 * @access Customer
 */
orderCustomerRouter.patch('/:id/cancel', OrderController.cancelCustomerOrder);

// ===================================================
// ADMIN ORDER ROUTES
// ===================================================
orderAdminRouter.use(requireAuth, requireRole(UserRole.ADMIN, UserRole.STAFF, UserRole.SUPER_ADMIN));

/**
 * @route GET /api/v1/admin/orders
 * @desc Admin list all orders with pagination & status filters
 * @access Admin, Staff
 */
orderAdminRouter.get('/', OrderController.getAdminOrders);

/**
 * @route PATCH /api/v1/admin/orders/:id/status
 * @desc Admin update order status
 * @access Admin, Staff
 */
orderAdminRouter.patch('/:id/status', OrderController.updateOrderStatus);

export {
  checkoutRouter,
  orderCustomerRouter,
  orderAdminRouter,
};
