import { Inventory, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ApiError } from '../utils/apiError';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { parseSort } from '../utils/queryHelpers';
import {
  CreateInventoryInput,
  UpdateInventoryConfigInput,
  AdjustStockInput,
  SetStockInput,
  InventoryQueryInput,
} from '../validators/inventory.validator';

export class InventoryService {
  /**
   * Computes human-readable availability state from quantity and threshold.
   */
  public static computeAvailability(quantity: number, lowStockThreshold: number): 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' {
    if (quantity <= 0) return 'OUT_OF_STOCK';
    if (quantity <= lowStockThreshold) return 'LOW_STOCK';
    return 'IN_STOCK';
  }

  /**
   * Creates an Inventory record for a product (Admin).
   */
  static async createInventory(input: CreateInventoryInput, adminId?: string): Promise<Inventory> {
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });
    if (!product) {
      throw ApiError.notFound(`Product with ID '${input.productId}' not found`, 'PRODUCT_NOT_FOUND');
    }

    const existing = await prisma.inventory.findUnique({
      where: { productId: input.productId },
    });
    if (existing) {
      throw ApiError.conflict(`Inventory already exists for product ID '${input.productId}'`, 'INVENTORY_ALREADY_EXISTS');
    }

    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.create({
        data: {
          productId: input.productId,
          quantity: input.quantity,
          lowStockThreshold: input.lowStockThreshold,
        },
        include: {
          product: { select: { id: true, name: true, sku: true, slug: true } },
        },
      });

      if (input.quantity > 0) {
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            productId: input.productId,
            change: input.quantity,
            quantityBefore: 0,
            quantityAfter: input.quantity,
            reason: 'INITIAL_STOCK',
            createdBy: adminId || null,
          },
        });
      }

      return inventory;
    });
  }

  /**
   * Retrieves inventory record by product ID with computed availability.
   */
  static async getInventoryByProductId(productId: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: { select: { id: true, name: true, sku: true, slug: true } },
      },
    });

    if (!inventory) {
      throw ApiError.notFound(`Inventory for product ID '${productId}' not found`, 'INVENTORY_NOT_FOUND');
    }

    const availability = this.computeAvailability(inventory.quantity, inventory.lowStockThreshold);

    return {
      ...inventory,
      availability,
    };
  }

  /**
   * Retrieves paginated admin inventory list with status filtering, search, and sorting.
   */
  static async getAdminInventoryList(query: InventoryQueryInput) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: Prisma.InventoryWhereInput = {};

    if (query.search && query.search.trim()) {
      const searchStr = query.search.trim();
      where.product = {
        OR: [
          { name: { contains: searchStr } },
          { sku: { contains: searchStr } },
        ],
      };
    }

    if (query.status === 'out_of_stock') {
      where.quantity = 0;
    }

    const allowedSortFields = ['quantity', 'updatedAt'];
    const { field, order } = parseSort(query.sortBy, allowedSortFields, 'updatedAt', query.sortOrder);

    const [total, items] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take,
        orderBy: { [field]: order },
        include: {
          product: { select: { id: true, name: true, sku: true, slug: true, isActive: true } },
        },
      }),
    ]);

    // Apply low_stock or in_stock status filtering in memory if required
    let filteredItems = items.map((inv) => ({
      ...inv,
      availability: this.computeAvailability(inv.quantity, inv.lowStockThreshold),
    }));

    if (query.status === 'low_stock') {
      filteredItems = filteredItems.filter((inv) => inv.availability === 'LOW_STOCK');
    } else if (query.status === 'in_stock') {
      filteredItems = filteredItems.filter((inv) => inv.availability === 'IN_STOCK');
    }

    const meta = buildPaginationMeta(total, page, limit);

    return { inventory: filteredItems, meta };
  }

  /**
   * Retrieves products with low stock (quantity > 0 AND quantity <= lowStockThreshold).
   */
  static async getLowStockInventory(query: { page?: string; limit?: string }) {
    const { page, limit, skip, take } = parsePagination(query);

    // Fetch items where quantity > 0
    const where: Prisma.InventoryWhereInput = {
      quantity: { gt: 0 },
    };

    const allLowStock = await prisma.inventory.findMany({
      where,
      orderBy: { quantity: 'asc' },
      include: {
        product: { select: { id: true, name: true, sku: true, slug: true, isActive: true } },
      },
    });

    const lowStockItems = allLowStock
      .filter((inv) => inv.quantity <= inv.lowStockThreshold)
      .map((inv) => ({
        ...inv,
        availability: 'LOW_STOCK' as const,
      }));

    const total = lowStockItems.length;
    const paginatedItems = lowStockItems.slice(skip, skip + take);
    const meta = buildPaginationMeta(total, page, limit);

    return { inventory: paginatedItems, meta };
  }

  /**
   * Retrieves products that are out of stock (quantity = 0).
   */
  static async getOutOfStockInventory(query: { page?: string; limit?: string }) {
    const { page, limit, skip, take } = parsePagination(query);

    const where: Prisma.InventoryWhereInput = {
      quantity: 0,
    };

    const [total, items] = await Promise.all([
      prisma.inventory.count({ where }),
      prisma.inventory.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, sku: true, slug: true, isActive: true } },
        },
      }),
    ]);

    const formatted = items.map((inv) => ({
      ...inv,
      availability: 'OUT_OF_STOCK' as const,
    }));

    const meta = buildPaginationMeta(total, page, limit);

    return { inventory: formatted, meta };
  }

  /**
   * Updates inventory low stock threshold configuration.
   */
  static async updateInventoryConfig(productId: string, input: UpdateInventoryConfigInput): Promise<Inventory> {
    const existing = await prisma.inventory.findUnique({
      where: { productId },
    });
    if (!existing) {
      throw ApiError.notFound(`Inventory for product ID '${productId}' not found`, 'INVENTORY_NOT_FOUND');
    }

    return prisma.inventory.update({
      where: { productId },
      data: { lowStockThreshold: input.lowStockThreshold },
      include: {
        product: { select: { id: true, name: true, sku: true, slug: true } },
      },
    });
  }

  /**
   * Atomically adjusts inventory stock (+N or -N) with negative stock prevention.
   */
  static async adjustStock(productId: string, input: AdjustStockInput, adminId?: string) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { productId },
      });
      if (!inventory) {
        throw ApiError.notFound(`Inventory for product ID '${productId}' not found`, 'INVENTORY_NOT_FOUND');
      }

      const quantityBefore = inventory.quantity;
      const quantityAfter = quantityBefore + input.change;

      if (quantityAfter < 0) {
        throw ApiError.badRequest(
          `Insufficient stock. Current quantity is ${quantityBefore}, attempted adjustment of ${input.change} results in negative stock (${quantityAfter}).`,
          'INSUFFICIENT_STOCK'
        );
      }

      const updated = await tx.inventory.update({
        where: { productId },
        data: { quantity: quantityAfter },
        include: {
          product: { select: { id: true, name: true, sku: true, slug: true } },
        },
      });

      await tx.inventoryTransaction.create({
        data: {
          inventoryId: inventory.id,
          productId,
          change: input.change,
          quantityBefore,
          quantityAfter,
          reason: input.reason.trim(),
          createdBy: adminId || null,
        },
      });

      const availability = this.computeAvailability(updated.quantity, updated.lowStockThreshold);

      return {
        ...updated,
        availability,
      };
    });
  }

  /**
   * Atomically sets inventory stock to an exact quantity.
   */
  static async setStock(productId: string, input: SetStockInput, adminId?: string) {
    return prisma.$transaction(async (tx) => {
      const inventory = await tx.inventory.findUnique({
        where: { productId },
      });
      if (!inventory) {
        throw ApiError.notFound(`Inventory for product ID '${productId}' not found`, 'INVENTORY_NOT_FOUND');
      }

      const quantityBefore = inventory.quantity;
      const quantityAfter = input.quantity;
      const change = quantityAfter - quantityBefore;

      const updated = await tx.inventory.update({
        where: { productId },
        data: { quantity: quantityAfter },
        include: {
          product: { select: { id: true, name: true, sku: true, slug: true } },
        },
      });

      if (change !== 0) {
        await tx.inventoryTransaction.create({
          data: {
            inventoryId: inventory.id,
            productId,
            change,
            quantityBefore,
            quantityAfter,
            reason: input.reason.trim(),
            createdBy: adminId || null,
          },
        });
      }

      const availability = this.computeAvailability(updated.quantity, updated.lowStockThreshold);

      return {
        ...updated,
        availability,
      };
    });
  }

  /**
   * Retrieves paginated inventory audit transaction history for a product.
   */
  static async getInventoryHistory(productId: string, query: { page?: string; limit?: string }) {
    const inventory = await prisma.inventory.findUnique({
      where: { productId },
    });
    if (!inventory) {
      throw ApiError.notFound(`Inventory for product ID '${productId}' not found`, 'INVENTORY_NOT_FOUND');
    }

    const { page, limit, skip, take } = parsePagination(query);

    const where: Prisma.InventoryTransactionWhereInput = {
      productId,
    };

    const [total, transactions] = await Promise.all([
      prisma.inventoryTransaction.count({ where }),
      prisma.inventoryTransaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const meta = buildPaginationMeta(total, page, limit);

    return { transactions, meta };
  }
}
