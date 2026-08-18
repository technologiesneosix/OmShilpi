import { z } from 'zod';

const safeCtaLink = z
  .string()
  .trim()
  .refine((url) => !url.toLowerCase().startsWith('javascript:'), {
    message: 'Unsafe URL protocol detected (javascript: is not allowed)',
  })
  .optional()
  .nullable();

const heroSectionSchema = z.object({
  title: z.string().trim().max(200).optional(),
  subtitle: z.string().trim().max(300).optional(),
  description: z.string().trim().max(1000).optional(),
  ctaText: z.string().trim().max(50).optional(),
  ctaLink: safeCtaLink,
  imageUrl: z.string().trim().url().optional().nullable(),
}).partial();

const brandMessageSchema = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
}).partial();

export const updateHomepageContentSchema = z.object({
  hero: heroSectionSchema.optional(),
  brandMessage: brandMessageSchema.optional(),
  about: z.record(z.any()).optional(),
  featuredCollections: z.array(z.string()).optional(),
  featuredProducts: z.array(z.string()).optional(),
  promotionalBanner: z.record(z.any()).optional(),
  customSections: z.record(z.any()).optional(),
});

export type UpdateHomepageContentInput = z.infer<typeof updateHomepageContentSchema>;
