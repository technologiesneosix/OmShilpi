import { z } from 'zod';

export const createAddressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters long'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\s-]{8,15}$/, 'Invalid phone number format'),
  addressLine1: z.string().trim().min(3, 'Address line 1 must be at least 3 characters long'),
  addressLine2: z.string().trim().optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z\s-]{3,10}$/, 'Invalid postal code format'),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export const addressIdParamSchema = z.object({
  id: z.string().min(1, 'Address ID is required'),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
