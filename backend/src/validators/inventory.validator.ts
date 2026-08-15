import { z } from 'zod';

export const createInventorySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int('Quantity must be an integer').nonnegative('Quantity cannot be negative').default(0),
  lowStockThreshold: z.number().int('Threshold must be an integer').nonnegative('Threshold cannot be negative').default(5),
});

export const updateInventoryConfigSchema = z.object({
  lowStockThreshold: z.number().int('Threshold must be an integer').nonnegative('Threshold cannot be negative'),
});

export const adjustStockSchema = z.object({
  change: z.number().int('Stock adjustment change must be an integer').refine(val => val !== 0, 'Adjustment change cannot be zero'),
  reason: z.string().trim().min(2, 'Stock adjustment reason must be at least 2 characters long'),
});

export const setStockSchema = z.object({
  quantity: z.number().int('Quantity must be an integer').nonnegative('Quantity cannot be negative'),
  reason: z.string().trim().min(2, 'Reason must be at least 2 characters long'),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export const inventoryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['in_stock', 'low_stock', 'out_of_stock', 'all']).default('all'),
  sortBy: z.enum(['quantity', 'updatedAt']).default('updatedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryConfigInput = z.infer<typeof updateInventoryConfigSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
export type SetStockInput = z.infer<typeof setStockSchema>;
export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>;
