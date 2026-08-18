import { z } from 'zod';
import { EnquiryStatus } from '@prisma/client';

export const createEnquirySchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must not exceed 100 characters'),
    email: z
      .string({ required_error: 'Email is required' })
      .trim()
      .email('Invalid email address format')
      .transform((val) => val.toLowerCase())
      .refine((val) => val.length <= 150, 'Email must not exceed 150 characters'),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 characters long')
      .max(20, 'Phone number must not exceed 20 characters')
      .regex(/^[+]*[0-9\s()\-.]+$/, 'Invalid phone number format')
      .optional()
      .or(z.literal('')),
    subject: z
      .string({ required_error: 'Subject is required' })
      .trim()
      .min(2, 'Subject must be at least 2 characters long')
      .max(150, 'Subject must not exceed 150 characters'),
    message: z
      .string({ required_error: 'Message is required' })
      .trim()
      .min(5, 'Message must be at least 5 characters long')
      .max(2000, 'Message must not exceed 2000 characters'),
  })
  .strict();

export const updateEnquiryStatusSchema = z
  .object({
    status: z.nativeEnum(EnquiryStatus, {
      required_error: 'Status is required',
      invalid_type_error: 'Invalid enquiry status',
    }),
  })
  .strict();

export const enquiryQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 10)) : 10)),
  search: z.string().trim().optional(),
  status: z
    .enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'all'])
    .optional()
    .default('all'),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'name', 'status'])
    .optional()
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateEnquiryInput = z.infer<typeof createEnquirySchema>;
export type UpdateEnquiryStatusInput = z.infer<typeof updateEnquiryStatusSchema>;
export type EnquiryQueryInput = z.infer<typeof enquiryQuerySchema>;
