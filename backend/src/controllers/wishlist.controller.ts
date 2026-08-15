import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { WishlistService } from '../services/wishlist.service';
import {
  addWishlistItemSchema,
  wishlistItemIdParamSchema,
} from '../validators/wishlist.validator';

export class WishlistController {
  /**
   * Retrieves customer wishlist (Customer).
   * GET /api/v1/wishlist
   */
  static getWishlist = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const wishlist = await WishlistService.getWishlist(userId);

    return ApiResponse.success(res, 'Wishlist retrieved successfully', wishlist);
  });

  /**
   * Retrieves item count in customer wishlist (Customer).
   * GET /api/v1/wishlist/count
   */
  static getWishlistCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const count = await WishlistService.getWishlistCount(userId);

    return ApiResponse.success(res, 'Wishlist count retrieved successfully', count);
  });

  /**
   * Adds a product to customer wishlist (Customer).
   * POST /api/v1/wishlist/items
   */
  static addWishlistItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const input = addWishlistItemSchema.parse(req.body);
    const wishlist = await WishlistService.addWishlistItem(userId, input);

    return ApiResponse.success(res, 'Product added to wishlist successfully', wishlist, 201);
  });

  /**
   * Removes an item from customer wishlist (Customer).
   * DELETE /api/v1/wishlist/items/:itemId
   */
  static removeWishlistItem = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { itemId } = wishlistItemIdParamSchema.parse(req.params);
    const wishlist = await WishlistService.removeWishlistItem(userId, itemId);

    return ApiResponse.success(res, 'Wishlist item removed successfully', wishlist);
  });
}
