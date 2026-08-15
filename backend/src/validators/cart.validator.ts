import { z } from 'zod';

export const addCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(1, 'Minimum quantity is 1')
    .max(10, 'Maximum allowed quantity per cart item is 10')
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .int('Quantity must be an integer')
    .min(1, 'Minimum quantity is 1')
    .max(10, 'Maximum allowed quantity per cart item is 10'),
});

export const cartItemIdParamSchema = z.object({
  itemId: z.string().min(1, 'Cart item ID is required'),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
