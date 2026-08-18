import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination } from '../utils/pagination';
import { AdminOrderQueryInput } from '../validators/order.validator';
import { EmailService } from './email.service';
import { AuditService } from './audit.service';

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.READY_FOR_DISPATCH, OrderStatus.CANCELLED],
  [OrderStatus.READY_FOR_DISPATCH]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [],
};

export class OrderService {
  /**
   * Retrieves paginated order history for customer.
   */
  static async getCustomerOrders(userId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip, take } = parsePagination(query);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          payments: {
            select: {
              id: true,
              provider: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Retrieves specific order details by ID for customer with strict ownership check.
   */
  static async getCustomerOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: {
          select: {
            id: true,
            provider: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
            createdAt: true,
          },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw ApiError.notFound(`Order with ID '${orderId}' not found`, 'ORDER_NOT_FOUND');
    }

    return order;
  }

  /**
   * Customer cancels an order (only allowed if status is PENDING or CONFIRMED).
   * Restores inventory stock atomically inside transaction.
   */
  static async cancelCustomerOrder(userId: string, orderId: string) {
    const order = await this.getCustomerOrderById(userId, orderId);

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw ApiError.badRequest(
        `Order '${order.orderNumber}' cannot be cancelled in '${order.status}' status`,
        'ORDER_CANNOT_BE_CANCELLED'
      );
    }

    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true },
      });

      // Restore Inventory Stock
      for (const item of order.items) {
        if (item.productId) {
          const inventory = await tx.inventory.findUnique({
            where: { productId: item.productId },
          });

          if (inventory) {
            const quantityBefore = inventory.quantity;
            const quantityAfter = quantityBefore + item.quantity;

            await tx.inventory.update({
              where: { id: inventory.id },
              data: { quantity: { increment: item.quantity } },
            });

            await tx.inventoryTransaction.create({
              data: {
                inventoryId: inventory.id,
                productId: item.productId,
                change: item.quantity,
                quantityBefore,
                quantityAfter,
                reason: 'ORDER_CANCELLED',
                createdBy: userId,
              },
            });
          }
        }
      }

      return updatedOrder;
    });
  }

  /**
   * Admin retrieves paginated orders with filtering and search.
   */
  static async getAdminOrders(query: AdminOrderQueryInput) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }
    if (query.paymentStatus) {
      where.paymentStatus = query.paymentStatus;
    }
    if (query.search) {
      where.OR = [
        { orderNumber: { contains: query.search } },
        { shippingFullName: { contains: query.search } },
        { shippingPhone: { contains: query.search } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          payments: {
            select: {
              id: true,
              provider: true,
              amount: true,
              currency: true,
              status: true,
              method: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((o) => ({
      ...o,
      shippingAddress: {
        fullName: o.shippingFullName,
        phone: o.shippingPhone,
        addressLine1: o.shippingAddressLine1,
        addressLine2: o.shippingAddressLine2,
        city: o.shippingCity,
        state: o.shippingState,
        postalCode: o.shippingPostalCode,
        country: o.shippingCountry,
      },
    }));

    return {
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin retrieves complete order details by ID.
   */
  static async getAdminOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        payments: {
          select: {
            id: true,
            orderId: true,
            provider: true,
            providerOrderId: true,
            providerPaymentId: true,
            amount: true,
            currency: true,
            status: true,
            method: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!order) {
      throw ApiError.notFound(`Order with ID '${orderId}' not found`, 'ORDER_NOT_FOUND');
    }

    return {
      ...order,
      shippingAddress: {
        fullName: order.shippingFullName,
        phone: order.shippingPhone,
        addressLine1: order.shippingAddressLine1,
        addressLine2: order.shippingAddressLine2,
        city: order.shippingCity,
        state: order.shippingState,
        postalCode: order.shippingPostalCode,
        country: order.shippingCountry,
      },
    };
  }

  /**
   * Admin updates order status with transition validation and inventory safety.
   */
  static async updateOrderStatus(orderId: string, newStatus: OrderStatus, updatedBy?: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw ApiError.notFound(`Order with ID '${orderId}' not found`, 'ORDER_NOT_FOUND');
    }

    // Idempotent check
    if (order.status === newStatus) {
      return order;
    }

    // Validate status transition state machine
    const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(
        `Cannot transition order status from '${order.status}' to '${newStatus}'`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Perform status update & inventory restoration if CANCELLED or RETURNED
    const resultOrder = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
        include: {
          items: true,
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
          payments: true,
        },
      });

      // If transitioning to CANCELLED or RETURNED, restore inventory
      if (newStatus === OrderStatus.CANCELLED || newStatus === OrderStatus.RETURNED) {
        for (const item of order.items) {
          if (item.productId) {
            const inventory = await tx.inventory.findUnique({
              where: { productId: item.productId },
            });

            if (inventory) {
              const quantityBefore = inventory.quantity;
              const quantityAfter = quantityBefore + item.quantity;

              await tx.inventory.update({
                where: { id: inventory.id },
                data: { quantity: { increment: item.quantity } },
              });

              await tx.inventoryTransaction.create({
                data: {
                  inventoryId: inventory.id,
                  productId: item.productId,
                  change: item.quantity,
                  quantityBefore,
                  quantityAfter,
                  reason: newStatus === OrderStatus.CANCELLED ? 'ORDER_CANCELLED' : 'ORDER_RETURNED',
                  createdBy: updatedBy || 'ADMIN',
                },
              });
            }
          }
        }
      }

      return updatedOrder;
    });

    // Trigger Order Status Email (Decoupled & Fail-Safe)
    const userEmail = resultOrder.user?.email || 'customer@example.com';
    EmailService.sendOrderStatusEmail(resultOrder, newStatus, userEmail, resultOrder.user?.name).catch(() => {});

    // Record Security Audit Log
    AuditService.log({
      actorId: updatedBy || 'ADMIN',
      action: 'ORDER_STATUS_CHANGED',
      resourceType: 'ORDER',
      resourceId: orderId,
      details: { newStatus },
    }).catch(() => {});

    return resultOrder;
  }
}
