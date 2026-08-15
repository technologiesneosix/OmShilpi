import { z } from 'zod';

export const checkoutPreviewSchema = z.object({
  addressId: z.string().optional(),
  shippingAddressId: z.string().optional(),
});

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  shippingAddressId: z.string().optional(),
  notes: z.string().trim().optional(),
}).refine(
  (data) => Boolean(data.addressId || data.shippingAddressId),
  {
    message: 'Either addressId or shippingAddressId is required',
    path: ['addressId'],
  }
);

export type CheckoutPreviewInput = z.infer<typeof checkoutPreviewSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
