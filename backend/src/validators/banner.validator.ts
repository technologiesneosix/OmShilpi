import { z } from 'zod';

const safeUrl = z
  .string()
  .trim()
  .refine((url) => !url.toLowerCase().startsWith('javascript:'), {
    message: 'Unsafe URL protocol detected (javascript: is not allowed)',
  });

const safeHttpUrl = safeUrl.pipe(z.string().url('Must be a valid URL'));

export const createBannerSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(150, 'Title cannot exceed 150 characters'),
    subtitle: z.string().trim().max(200, 'Subtitle cannot exceed 200 characters').optional().nullable(),
    description: z.string().trim().max(1000, 'Description cannot exceed 1000 characters').optional().nullable(),
    imageUrl: safeHttpUrl,
    mobileImageUrl: safeHttpUrl.optional().nullable().or(z.literal('')),
    ctaText: z.string().trim().max(50, 'ctaText cannot exceed 50 characters').optional().nullable(),
    ctaLink: safeUrl.optional().nullable().or(z.literal('')),
    buttonText: z.string().trim().max(50, 'buttonText cannot exceed 50 characters').optional().nullable(),
    buttonUrl: safeUrl.optional().nullable().or(z.literal('')),
    sortOrder: z.number().int().min(0, 'sortOrder must be a non-negative integer').optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateBannerSchema = createBannerSchema.partial().strict();

export const bannerQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isActive: z.string().optional(),
});

export type CreateBannerInput = z.infer<typeof createBannerSchema>;
export type UpdateBannerInput = z.infer<typeof updateBannerSchema>;
