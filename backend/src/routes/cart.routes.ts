import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { CartController } from '../controllers/cart.controller';

const router = Router();

// Require authentication for all cart operations
router.use(requireAuth);

/**
 * @route GET /api/v1/cart
 * @desc Get authenticated customer's cart
 * @access Customer
 */
router.get('/', CartController.getCart);

/**
 * @route GET /api/v1/cart/count
 * @desc Get total item quantity count in customer's cart
 * @access Customer
 * NOTE: Registered before /items/:itemId to prevent route collision!
 */
router.get('/count', CartController.getCartCount);

/**
 * @route POST /api/v1/cart or POST /api/v1/cart/items
 * @desc Add item to cart
 * @access Customer
 */
router.post(['/', '/items'], CartController.addItemToCart);

/**
 * @route PATCH /api/v1/cart/items/:itemId
 * @desc Update cart item quantity
 * @access Customer
 */
router.patch('/items/:itemId', CartController.updateCartItemQuantity);

/**
 * @route DELETE /api/v1/cart/items/:itemId
 * @desc Remove item from cart
 * @access Customer
 */
router.delete('/items/:itemId', CartController.removeCartItem);

/**
 * @route DELETE /api/v1/cart
 * @desc Clear all items from customer's cart
 * @access Customer
 */
router.delete('/', CartController.clearCart);

export default router;
