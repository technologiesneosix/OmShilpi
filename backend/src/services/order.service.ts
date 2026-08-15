import { OrderStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination } from '../utils/pagination';
import { AdminOrderQueryInput } from '../validators/order.validator';

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
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves specific order details by ID for customer with ownership check.
   */
  static async getCustomerOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
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
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin updates order status.
   */
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw ApiError.notFound(`Order with ID '${orderId}' not found`, 'ORDER_NOT_FOUND');
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: { items: true },
    });
  }
}
