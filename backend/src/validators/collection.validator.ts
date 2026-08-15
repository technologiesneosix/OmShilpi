import { z } from 'zod';

export const createCollectionSchema = z.object({
  name: z.string().trim().min(2, 'Collection name must be at least 2 characters long'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional()
    .or(z.literal('')),
  description: z.string().trim().optional(),
  image: z.string().trim().url('Image must be a valid URL').optional().or(z.literal('')),
  bannerImage: z.string().trim().url('Banner image must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCollectionSchema = z.object({
  name: z.string().trim().min(2, 'Collection name must be at least 2 characters long').optional(),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase alphanumeric characters and hyphens')
    .optional(),
  description: z.string().trim().optional().nullable(),
  image: z.string().trim().url('Image must be a valid URL').optional().nullable(),
  bannerImage: z.string().trim().url('Banner image must be a valid URL').optional().nullable(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const collectionIdParamSchema = z.object({
  id: z.string().min(1, 'Collection ID is required'),
});

export const collectionSlugParamSchema = z.object({
  slug: z.string().min(1, 'Collection slug is required'),
});

export const adminCollectionQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.enum(['active', 'inactive', 'all']).default('all'),
  sortBy: z.enum(['name', 'sortOrder', 'createdAt', 'updatedAt']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;
export type UpdateCollectionInput = z.infer<typeof updateCollectionSchema>;
export type AdminCollectionQueryInput = z.infer<typeof adminCollectionQuerySchema>;
