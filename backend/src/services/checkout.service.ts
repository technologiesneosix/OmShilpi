import { OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { CheckoutPreviewInput, CheckoutInput } from '../validators/checkout.validator';
import { AddressService } from './address.service';
import { CartService } from './cart.service';

// In-memory Idempotency Cache for Checkout Protection (Key -> Order Payload, TTL 10 mins)
const idempotencyCache = new Map<string, { order: any; timestamp: number }>();
const IDEMPOTENCY_TTL_MS = 10 * 60 * 1000;

function cleanExpiredIdempotencyKeys() {
  const now = Date.now();
  for (const [key, item] of idempotencyCache.entries()) {
    if (now - item.timestamp > IDEMPOTENCY_TTL_MS) {
      idempotencyCache.delete(key);
    }
  }
}

export class CheckoutService {
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
   * Does NOT create Order, does NOT deduct stock, does NOT clear cart.
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

    const targetAddressId = input.addressId || input.shippingAddressId;
    let selectedAddress = null;
    if (targetAddressId) {
      selectedAddress = await AddressService.getAddressById(userId, targetAddressId);
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
   * Executes final checkout converting cart to Order atomically.
   * Revalidates stock, deducts inventory, creates order, logs InventoryTransaction (ORDER_PLACED), and clears cart inside $transaction.
   */
  static async executeCheckout(userId: string, input: CheckoutInput, idempotencyKey?: string) {
    cleanExpiredIdempotencyKeys();

    if (idempotencyKey) {
      const cached = idempotencyCache.get(`${userId}:${idempotencyKey}`);
      if (cached) {
        return cached.order;
      }
    }

    const targetAddressId = (input.addressId || input.shippingAddressId)!;
    const shippingAddress = await AddressService.getAddressById(userId, targetAddressId);

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

    // Pre-transaction validation of product active state
    for (const item of cartItems) {
      if (!item.product.isActive) {
        throw ApiError.badRequest(`Product '${item.product.name}' is currently unavailable`, 'PRODUCT_UNAVAILABLE');
      }
    }

    // Execute atomic transaction for inventory deduction, order creation, audit logging, and cart clearing
    const order = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of cartItems) {
        const unitPrice = Number(item.product.price);
        const totalPrice = unitPrice * item.quantity;
        subtotal += totalPrice;

        orderItemsData.push({
          productId: item.productId,
          productNameSnapshot: item.product.name,
          skuSnapshot: item.product.sku,
          unitPrice,
          quantity: item.quantity,
          totalPrice,
        });
      }

      // 1. Atomic Stock Deduction (executes BEFORE Order creation to ensure row-level lock)
      const inventoryAuditLogs = [];
      for (const itemData of orderItemsData) {
        const invBefore = await tx.inventory.findUnique({
          where: { productId: itemData.productId },
        });

        const currentStock = invBefore?.quantity ?? 0;
        if (!invBefore || currentStock < itemData.quantity) {
          throw ApiError.badRequest(
            `Insufficient stock for '${itemData.productNameSnapshot}'. Available: ${currentStock}, Requested: ${itemData.quantity}`,
            'INSUFFICIENT_STOCK'
          );
        }

        // Atomic conditional decrement preventing race conditions and negative stock
        const updatedCount = await tx.$executeRaw`
          UPDATE Inventory 
          SET quantity = quantity - ${itemData.quantity} 
          WHERE productId = ${itemData.productId} AND (quantity - ${itemData.quantity}) >= 0
        `;

        if (updatedCount === 0) {
          throw ApiError.badRequest(
            `Insufficient stock for '${itemData.productNameSnapshot}'. Available: ${currentStock}, Requested: ${itemData.quantity}`,
            'INSUFFICIENT_STOCK'
          );
        }

        inventoryAuditLogs.push({
          inventoryId: invBefore.id,
          productId: itemData.productId,
          change: -itemData.quantity,
          quantityBefore: currentStock,
          quantityAfter: currentStock - itemData.quantity,
        });
      }

      const orderNumber = this.generateOrderNumber();
      const shippingAmount = 0.0;
      const tax = 0.0;
      const discount = 0.0;
      const total = subtotal + shippingAmount + tax - discount;

      // 2. Create Order record with address snapshot
      const createdOrder = await tx.order.create({
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
            create: orderItemsData.map((d) => ({
              productId: d.productId,
              productNameSnapshot: d.productNameSnapshot,
              skuSnapshot: d.skuSnapshot,
              unitPrice: d.unitPrice,
              quantity: d.quantity,
              totalPrice: d.totalPrice,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // 3. Record Inventory Transactions for audit history
      for (const log of inventoryAuditLogs) {
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: log.inventoryId,
            productId: log.productId,
            change: log.change,
            quantityBefore: log.quantityBefore,
            quantityAfter: log.quantityAfter,
            reason: 'ORDER_PLACED',
            createdBy: userId,
          },
        });
      }

      // 4. Clear Customer Cart Items ONLY after successful order creation & stock deduction
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return createdOrder;
    });

    if (idempotencyKey) {
      idempotencyCache.set(`${userId}:${idempotencyKey}`, {
        order,
        timestamp: Date.now(),
      });
    }

    return order;
  }
}
