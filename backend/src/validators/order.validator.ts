import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const checkoutPreviewSchema = z.object({
  shippingAddressId: z.string().optional(),
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address ID is required'),
  notes: z.string().trim().optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, {
    errorMap: () => ({ message: 'Invalid order status' }),
  }),
});

export const adminOrderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus).optional(),
  search: z.string().optional(),
});

export const customerOrderQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type AdminOrderQueryInput = z.infer<typeof adminOrderQuerySchema>;
export type CustomerOrderQueryInput = z.infer<typeof customerOrderQuerySchema>;
