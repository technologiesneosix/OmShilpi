import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { WishlistController } from '../controllers/wishlist.controller';

const router = Router();

// Require authentication for all wishlist operations
router.use(requireAuth);

/**
 * @route GET /api/v1/wishlist
 * @desc Get authenticated customer's wishlist
 * @access Customer
 */
router.get('/', WishlistController.getWishlist);

/**
 * @route GET /api/v1/wishlist/count
 * @desc Get total item count in customer's wishlist
 * @access Customer
 * NOTE: Registered before /items/:itemId to prevent route collision!
 */
router.get('/count', WishlistController.getWishlistCount);

/**
 * @route POST /api/v1/wishlist/items
 * @desc Add product to wishlist
 * @access Customer
 */
router.post('/items', WishlistController.addWishlistItem);

/**
 * @route DELETE /api/v1/wishlist/items/:itemId
 * @desc Remove item from wishlist
 * @access Customer
 */
router.delete('/items/:itemId', WishlistController.removeWishlistItem);

export default router;
