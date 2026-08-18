import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { CheckoutController } from '../controllers/checkout.controller';

const router = Router();

// All checkout endpoints require authentication
router.use(requireAuth);

/**
 * @route POST /api/v1/checkout/preview
 * @route GET /api/v1/checkout/preview
 * @desc Generate checkout preview summary with calculated totals and stock availability
 * @access Customer
 */
router.post('/preview', CheckoutController.getCheckoutPreview);
router.get('/preview', CheckoutController.getCheckoutPreview);

/**
 * @route POST /api/v1/checkout
 * @desc Execute final checkout converting customer cart into an Order
 * @access Customer
 */
router.post('/', CheckoutController.executeCheckout);

export default router;
