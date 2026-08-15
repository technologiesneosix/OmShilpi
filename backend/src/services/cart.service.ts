import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AddCartItemInput, UpdateCartItemInput } from '../validators/cart.validator';

const MAX_CART_ITEM_QUANTITY = 10;
const MAX_DISTINCT_CART_ITEMS = 50;

export class CartService {
  /**
   * Finds or creates a Cart for a given user ID.
   */
  static async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
      });
    }

    return cart;
  }

  /**
   * Retrieves full cart details for a user with calculated subtotal, item totals, and availability.
   */
  static async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      orderBy: { createdAt: 'desc' },
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
              select: { url: true, altText: true, isPrimary: true, sortOrder: true },
              orderBy: { sortOrder: 'asc' },
            },
            inventory: {
              select: { quantity: true, lowStockThreshold: true },
            },
          },
        },
      },
    });

    let subtotal = 0;
    let itemCount = 0;

    const formattedItems = cartItems.map((item) => {
      const product = item.product;
      const unitPrice = Number(product.price);
      const itemTotal = unitPrice * item.quantity;
      itemCount += item.quantity;

      // Determine availability
      let availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNAVAILABLE' = 'IN_STOCK';
      if (!product.isActive) {
        availability = 'UNAVAILABLE';
      } else if (!product.inventory || product.inventory.quantity <= 0) {
        availability = 'OUT_OF_STOCK';
      } else if (product.inventory.quantity <= product.inventory.lowStockThreshold) {
        availability = 'LOW_STOCK';
      }

      if (product.isActive && availability !== 'OUT_OF_STOCK') {
        subtotal += itemTotal;
      }

      const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || null;

      return {
        id: item.id,
        productId: product.id,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          sku: product.sku,
          price: unitPrice,
          image: primaryImage,
          isActive: product.isActive,
        },
        quantity: item.quantity,
        unitPrice,
        itemTotal,
        availability,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    });

    return {
      id: cart.id,
      items: formattedItems,
      subtotal,
      itemCount,
    };
  }

  /**
   * Returns lightweight total quantity count in customer cart.
   */
  static async getCartCount(userId: string): Promise<{ count: number }> {
    const cart = await this.getOrCreateCart(userId);
    const result = await prisma.cartItem.aggregate({
      where: { cartId: cart.id },
      _sum: { quantity: true },
    });

    return { count: result._sum.quantity || 0 };
  }

  /**
   * Adds a product to customer cart or increments quantity atomically.
   */
  static async addItemToCart(userId: string, input: AddCartItemInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
      include: {
        inventory: true,
      },
    });

    if (!product) {
      throw ApiError.notFound(`Product with ID '${input.productId}' not found`, 'PRODUCT_NOT_FOUND');
    }

    if (!product.isActive) {
      throw ApiError.badRequest(`Product '${product.name}' is currently unavailable`, 'PRODUCT_UNAVAILABLE');
    }

    const currentStock = product.inventory?.quantity ?? 0;
    if (currentStock <= 0) {
      throw ApiError.conflict(`Product '${product.name}' is out of stock`, 'OUT_OF_STOCK');
    }

    if (currentStock < input.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for '${product.name}'. Available: ${currentStock}, Requested: ${input.quantity}`,
        'INSUFFICIENT_STOCK'
      );
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const existingItem = existingItems.find((item) => item.productId === input.productId);

    if (!existingItem && existingItems.length >= MAX_DISTINCT_CART_ITEMS) {
      throw ApiError.badRequest(
        `Cart item limit reached. Maximum ${MAX_DISTINCT_CART_ITEMS} distinct items allowed per cart.`,
        'CART_ITEM_LIMIT_EXCEEDED'
      );
    }

    await prisma.$transaction(async (tx) => {
      if (existingItem) {
        const newQuantity = existingItem.quantity + input.quantity;
        if (newQuantity > MAX_CART_ITEM_QUANTITY) {
          throw ApiError.badRequest(
            `Maximum allowed quantity per cart item is ${MAX_CART_ITEM_QUANTITY}. Current: ${existingItem.quantity}, Attempted total: ${newQuantity}`,
            'CART_ITEM_LIMIT_EXCEEDED'
          );
        }
        if (currentStock < newQuantity) {
          throw ApiError.badRequest(
            `Insufficient stock for '${product.name}'. Available: ${currentStock}, Attempted total: ${newQuantity}`,
            'INSUFFICIENT_STOCK'
          );
        }

        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQuantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: input.productId,
            quantity: input.quantity,
          },
        });
      }
    });

    return this.getCart(userId);
  }

  /**
   * Updates quantity of an existing cart item.
   */
  static async updateCartItemQuantity(userId: string, itemId: string, input: UpdateCartItemInput) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        cart: true,
        product: { include: { inventory: true } },
      },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw ApiError.notFound(`Cart item with ID '${itemId}' not found in your cart`, 'CART_ITEM_NOT_FOUND');
    }

    if (!cartItem.product.isActive) {
      throw ApiError.badRequest(`Product '${cartItem.product.name}' is currently unavailable`, 'PRODUCT_UNAVAILABLE');
    }

    const currentStock = cartItem.product.inventory?.quantity ?? 0;
    if (currentStock < input.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for '${cartItem.product.name}'. Available: ${currentStock}, Requested: ${input.quantity}`,
        'INSUFFICIENT_STOCK'
      );
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: input.quantity },
    });

    return this.getCart(userId);
  }

  /**
   * Removes a single item from customer cart.
   */
  static async removeCartItem(userId: string, itemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.userId !== userId) {
      throw ApiError.notFound(`Cart item with ID '${itemId}' not found in your cart`, 'CART_ITEM_NOT_FOUND');
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return this.getCart(userId);
  }

  /**
   * Clears all items from customer cart.
   */
  static async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return this.getCart(userId);
  }
}
