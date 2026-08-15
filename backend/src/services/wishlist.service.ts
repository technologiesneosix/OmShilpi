import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { AddWishlistItemInput } from '../validators/wishlist.validator';

const MAX_WISHLIST_ITEMS = 100;

export class WishlistService {
  /**
   * Finds or creates a Wishlist for a given user ID.
   */
  static async getOrCreateWishlist(userId: string) {
    let wishlist = await prisma.wishlist.findUnique({
      where: { userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId },
      });
    }

    return wishlist;
  }

  /**
   * Retrieves full wishlist items for a user with product details and availability.
   */
  static async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist.id },
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

    const formattedItems = wishlistItems.map((item) => {
      const product = item.product;
      const unitPrice = Number(product.price);

      let availability: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNAVAILABLE' = 'IN_STOCK';
      if (!product.isActive) {
        availability = 'UNAVAILABLE';
      } else if (!product.inventory || product.inventory.quantity <= 0) {
        availability = 'OUT_OF_STOCK';
      } else if (product.inventory.quantity <= product.inventory.lowStockThreshold) {
        availability = 'LOW_STOCK';
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
        availability,
        createdAt: item.createdAt,
      };
    });

    return {
      id: wishlist.id,
      items: formattedItems,
      count: formattedItems.length,
    };
  }

  /**
   * Returns lightweight item count in customer wishlist.
   */
  static async getWishlistCount(userId: string): Promise<{ count: number }> {
    const wishlist = await this.getOrCreateWishlist(userId);
    const count = await prisma.wishlistItem.count({
      where: { wishlistId: wishlist.id },
    });

    return { count };
  }

  /**
   * Adds a product to customer wishlist.
   */
  static async addWishlistItem(userId: string, input: AddWishlistItemInput) {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) {
      throw ApiError.notFound(`Product with ID '${input.productId}' not found`, 'PRODUCT_NOT_FOUND');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId: input.productId,
        },
      },
    });

    if (existingItem) {
      throw ApiError.conflict(`Product '${product.name}' is already in your wishlist`, 'PRODUCT_ALREADY_WISHLISTED');
    }

    const currentCount = await prisma.wishlistItem.count({
      where: { wishlistId: wishlist.id },
    });

    if (currentCount >= MAX_WISHLIST_ITEMS) {
      throw ApiError.badRequest(
        `Wishlist limit reached. Maximum ${MAX_WISHLIST_ITEMS} items allowed in wishlist.`,
        'WISHLIST_LIMIT_EXCEEDED'
      );
    }

    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: input.productId,
      },
    });

    return this.getWishlist(userId);
  }

  /**
   * Removes an item from customer wishlist.
   */
  static async removeWishlistItem(userId: string, itemId: string) {
    const item = await prisma.wishlistItem.findUnique({
      where: { id: itemId },
      include: { wishlist: true },
    });

    if (!item || item.wishlist.userId !== userId) {
      throw ApiError.notFound(`Wishlist item with ID '${itemId}' not found in your wishlist`, 'WISHLIST_ITEM_NOT_FOUND');
    }

    await prisma.wishlistItem.delete({
      where: { id: itemId },
    });

    return this.getWishlist(userId);
  }
}
