import { z } from 'zod';

export const uploadImageBodySchema = z.object({
  altText: z.string().max(255, 'Alt text must not exceed 255 characters').optional(),
  isPrimary: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => val === true || val === 'true'),
  sortOrder: z
    .union([z.number(), z.string()])
    .optional()
    .transform((val) => (val !== undefined ? parseInt(String(val), 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 0), {
      message: 'Sort order must be a non-negative integer',
    }),
});

export const updateImageMetadataSchema = z.object({
  altText: z.string().max(255, 'Alt text must not exceed 255 characters').optional(),
  sortOrder: z
    .number({ invalid_type_error: 'Sort order must be a number' })
    .int('Sort order must be an integer')
    .min(0, 'Sort order cannot be negative')
    .optional(),
});

export const reorderImagesSchema = z.object({
  imageIds: z
    .array(z.string().min(1, 'Image ID cannot be empty'), {
      required_error: 'imageIds array is required',
    })
    .min(1, 'At least one image ID must be provided')
    .refine((items) => new Set(items).size === items.length, {
      message: 'Duplicate image IDs are not allowed in reorder list',
    }),
});

export const productIdParamSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

export const productImageParamsSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  imageId: z.string().min(1, 'Image ID is required'),
});

export type UploadImageBodyInput = z.infer<typeof uploadImageBodySchema>;
export type UpdateImageMetadataInput = z.infer<typeof updateImageMetadataSchema>;
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>;
