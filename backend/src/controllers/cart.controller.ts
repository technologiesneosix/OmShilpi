import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { CartService } from '../services/cart.service';
import {
  addCartItemSchema,
  updateCartItemSchema,
  cartItemIdParamSchema,
} from '../validators/cart.validator';

export class CartController {
  /**
   * Retrieves customer cart (Customer).
   * GET /api/v1/cart
   */
  static getCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await CartService.getCart(userId);

    return ApiResponse.success(res, 'Cart retrieved successfully', cart);
  });

  /**
   * Retrieves total quantity count in customer cart (Customer).
   * GET /api/v1/cart/count
   */
  static getCartCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const count = await CartService.getCartCount(userId);

    return ApiResponse.success(res, 'Cart count retrieved successfully', count);
  });

  /**
   * Adds an item to customer cart (Customer).
   * POST /api/v1/cart/items
   */
  static addItemToCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input = addCartItemSchema.parse(req.body);
    const cart = await CartService.addItemToCart(userId, input);

    return ApiResponse.success(res, 'Item added to cart successfully', cart, 201);
  });

  /**
   * Updates cart item quantity (Customer).
   * PATCH /api/v1/cart/items/:itemId
   */
  static updateCartItemQuantity = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { itemId } = cartItemIdParamSchema.parse(req.params);
    const input = updateCartItemSchema.parse(req.body);
    const cart = await CartService.updateCartItemQuantity(userId, itemId, input);

    return ApiResponse.success(res, 'Cart item quantity updated successfully', cart);
  });

  /**
   * Removes an item from customer cart (Customer).
   * DELETE /api/v1/cart/items/:itemId
   */
  static removeCartItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { itemId } = cartItemIdParamSchema.parse(req.params);
    const cart = await CartService.removeCartItem(userId, itemId);

    return ApiResponse.success(res, 'Cart item removed successfully', cart);
  });

  /**
   * Clears all items from customer cart (Customer).
   * DELETE /api/v1/cart
   */
  static clearCart = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const cart = await CartService.clearCart(userId);

    return ApiResponse.success(res, 'Cart cleared successfully', cart);
  });
}
