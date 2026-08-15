import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters long'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional()
    .or(z.literal('')),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters long'),
  shortDescription: z.string().trim().optional(),
  description: z.string().trim().optional(),

  // Monetary precision
  price: z
    .number()
    .positive('Price must be greater than 0')
    .or(z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Price must be a valid positive decimal number')),
  compareAtPrice: z
    .number()
    .nonnegative('Compare-at price cannot be negative')
    .or(z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Compare-at price must be a valid positive decimal number'))
    .optional()
    .nullable(),

  // Jewellery specifications
  metal: z.string().trim().optional().nullable(),
  purity: z.string().trim().optional().nullable(),
  grossWeight: z.number().nonnegative().or(z.string()).optional().nullable(),
  netWeight: z.number().nonnegative().or(z.string()).optional().nullable(),
  stoneType: z.string().trim().optional().nullable(),
  stoneWeight: z.number().nonnegative().or(z.string()).optional().nullable(),
  certification: z.string().trim().optional().nullable(),

  // Relationships & merchandising flags
  categoryId: z.string().trim().optional().nullable(),
  collectionId: z.string().trim().optional().nullable(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

export const updateProductSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters long').optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional(),
  sku: z.string().trim().min(2, 'SKU must be at least 2 characters long').optional(),
  shortDescription: z.string().trim().optional().nullable(),
  description: z.string().trim().optional().nullable(),

  // Monetary precision
  price: z
    .number()
    .positive('Price must be greater than 0')
    .or(z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Price must be a valid positive decimal number'))
    .optional(),
  compareAtPrice: z
    .number()
    .nonnegative('Compare-at price cannot be negative')
    .or(z.string().regex(/^\d+(?:\.\d{1,2})?$/, 'Compare-at price must be a valid positive decimal number'))
    .optional()
    .nullable(),

  // Jewellery specifications
  metal: z.string().trim().optional().nullable(),
  purity: z.string().trim().optional().nullable(),
  grossWeight: z.number().nonnegative().or(z.string()).optional().nullable(),
  netWeight: z.number().nonnegative().or(z.string()).optional().nullable(),
  stoneType: z.string().trim().optional().nullable(),
  stoneWeight: z.number().nonnegative().or(z.string()).optional().nullable(),
  certification: z.string().trim().optional().nullable(),

  // Relationships & merchandising flags
  categoryId: z.string().trim().optional().nullable(),
  collectionId: z.string().trim().optional().nullable(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
});

export const productIdParamSchema = z.object({
  id: z.string().min(1, 'Product ID is required'),
});

export const productSlugParamSchema = z.object({
  slug: z.string().min(1, 'Product slug is required'),
});

export const publicProductQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  collection: z.string().optional(),
  collectionId: z.string().optional(),
  featured: z.enum(['true', 'false']).optional(),
  newArrival: z.enum(['true', 'false']).optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const adminProductQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  collection: z.string().optional(),
  collectionId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  featured: z.enum(['true', 'false']).optional(),
  newArrival: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type PublicProductQueryInput = z.infer<typeof publicProductQuerySchema>;
export type AdminProductQueryInput = z.infer<typeof adminProductQuerySchema>;
