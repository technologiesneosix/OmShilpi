import { z } from 'zod';

const safeUrlSchema = z
  .string()
  .trim()
  .refine((url) => !url.toLowerCase().startsWith('javascript:'), {
    message: 'Unsafe URL protocol detected (javascript: is not allowed)',
  });

export const createTestimonialSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    designation: z.string().trim().max(100, 'Designation cannot exceed 100 characters').optional().nullable(),
    content: z.string().trim().min(1, 'Content is required').max(2000, 'Content cannot exceed 2000 characters'),
    rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5').optional().default(5),
    imageUrl: safeUrlSchema.pipe(z.string().url('imageUrl must be a valid URL')).optional().nullable().or(z.literal('')),
    sortOrder: z.number().int().min(0, 'sortOrder must be a non-negative integer').optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateTestimonialSchema = createTestimonialSchema.partial().strict();

export const testimonialQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isActive: z.string().optional(),
});

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
