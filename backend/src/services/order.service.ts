import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination } from '../utils/pagination';
import {
  CheckoutPreviewInput,
  CreateOrderInput,
  AdminOrderQueryInput,
} from '../validators/order.validator';
import { AddressService } from './address.service';
import { CartService } from './cart.service';

export class OrderService {
  /**
   * Helper to generate unique human-readable order number.
   * Format: OSJ-ORD-YYYYMMDD-XXXXX
   */
  private static generateOrderNumber(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
    return `OSJ-ORD-${dateStr}-${randomHex}`;
  }

  /**
   * Generates checkout preview calculating real-time subtotals, item availability, and address snapshot.
   */
  static async getCheckoutPreview(userId: string, input: CheckoutPreviewInput) {
    const cart = await CartService.getOrCreateCart(userId);

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            price: true,
            isActive: true,
            images: {
              select: { url: true, isPrimary: true },
              orderBy: { sortOrder: 'asc' },
            },
            inventory: {
              select: { quantity: true },
            },
          },
        },
      },
    });

    if (cartItems.length === 0) {
      throw ApiError.badRequest('Your cart is empty', 'CART_EMPTY');
    }

    let subtotal = 0;
    let totalItemCount = 0;
    let isCheckoutEligible = true;

    const items = cartItems.map((item) => {
      const product = item.product;
      const unitPrice = Number(product.price);
      const itemTotal = unitPrice * item.quantity;
      const currentStock = product.inventory?.quantity ?? 0;

      let isPurchasable = true;
      let unavailabilityReason: string | null = null;

      if (!product.isActive) {
        isPurchasable = false;
        isCheckoutEligible = false;
        unavailabilityReason = 'Product is currently inactive';
      } else if (currentStock <= 0) {
        isPurchasable = false;
        isCheckoutEligible = false;
        unavailabilityReason = 'Product is out of stock';
      } else if (currentStock < item.quantity) {
        isPurchasable = false;
        isCheckoutEligible = false;
        unavailabilityReason = `Insufficient stock (Available: ${currentStock}, Requested: ${item.quantity})`;
      }

      if (isPurchasable) {
        subtotal += itemTotal;
        totalItemCount += item.quantity;
      }

      const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || null;

      return {
        cartItemId: item.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        unitPrice,
        quantity: item.quantity,
        itemTotal,
        image: primaryImage,
        availableStock: currentStock,
        isPurchasable,
        unavailabilityReason,
      };
    });

    let selectedAddress = null;
    if (input.shippingAddressId) {
      selectedAddress = await AddressService.getAddressById(userId, input.shippingAddressId);
    } else {
      selectedAddress = await prisma.address.findFirst({
        where: { userId, isDefault: true },
      });
    }

    const shippingAmount = 0.0;
    const tax = 0.0;
    const discount = 0.0;
    const total = subtotal + shippingAmount + tax - discount;

    return {
      items,
      itemCount: totalItemCount,
      subtotal,
      shippingAmount,
      tax,
      discount,
      total,
      currency: 'INR',
      isCheckoutEligible,
      shippingAddress: selectedAddress,
    };
  }

  /**
   * Converts customer cart into a real Order, performs server-side validations,
   * deducts inventory stock atomically, records inventory transaction, and clears cart.
   */
  static async createOrder(userId: string, input: CreateOrderInput) {
    // 1. Fetch & Validate Cart
    const cart = await CartService.getOrCreateCart(userId);
    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: {
        product: {
          include: { inventory: true },
        },
      },
    });

    if (cartItems.length === 0) {
      throw ApiError.badRequest('Cannot place an order with an empty cart', 'CART_EMPTY');
    }

    // 2. Validate Shipping Address
    const shippingAddress = await AddressService.getAddressById(userId, input.shippingAddressId);

    // 3. Perform Server-Side Product & Stock Validations
    for (const item of cartItems) {
      const product = item.product;
      if (!product.isActive) {
        throw ApiError.badRequest(`Product '${product.name}' is currently unavailable`, 'PRODUCT_UNAVAILABLE');
      }

      const currentStock = product.inventory?.quantity ?? 0;
      if (currentStock < item.quantity) {
        throw ApiError.badRequest(
          `Insufficient stock for '${product.name}'. Available: ${currentStock}, Requested: ${item.quantity}`,
          'INSUFFICIENT_STOCK'
        );
      }
    }

    // 4. Execute Order Creation & Inventory Deduction inside Prisma Transaction
    return prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = cartItems.map((item) => {
        const unitPrice = Number(item.product.price);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        return {
          productId: item.productId,
          productNameSnapshot: item.product.name,
          skuSnapshot: item.product.sku,
          unitPrice,
          quantity: item.quantity,
          totalPrice,
        };
      });

      const orderNumber = this.generateOrderNumber();
      const shippingAmount = 0.0;
      const tax = 0.0;
      const discount = 0.0;
      const total = subtotal + shippingAmount + tax - discount;

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          discount,
          tax,
          shippingAmount,
          total,
          currency: 'INR',
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          shippingFullName: shippingAddress.fullName,
          shippingPhone: shippingAddress.phone,
          shippingAddressLine1: shippingAddress.addressLine1,
          shippingAddressLine2: shippingAddress.addressLine2 || null,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country || 'India',
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Deduct Inventory & Record Inventory Transactions
      for (const item of cartItems) {
        const inventory = item.product.inventory;
        if (inventory) {
          const quantityBefore = inventory.quantity;
          const quantityAfter = quantityBefore - item.quantity;

          await tx.inventory.update({
            where: { id: inventory.id },
            data: { quantity: quantityAfter },
          });

          await tx.inventoryTransaction.create({
            data: {
              inventoryId: inventory.id,
              productId: item.productId,
              change: -item.quantity,
              quantityBefore,
              quantityAfter,
              reason: 'ORDER_CREATED',
              createdBy: userId,
            },
          });
        }
      }

      // Clear Customer Cart Items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    });
  }

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
              data: { quantity: quantityAfter },
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
