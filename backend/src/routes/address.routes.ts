import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { AddressController } from '../controllers/address.controller';

const router = Router();

// All Address endpoints require CUSTOMER authentication
router.use(requireAuth, requireRole('CUSTOMER'));

/**
 * @route POST /api/v1/addresses
 * @desc Create a new customer address
 * @access Customer
 */
router.post('/', AddressController.createAddress);

/**
 * @route GET /api/v1/addresses
 * @desc Get all saved addresses for authenticated customer
 * @access Customer
 */
router.get('/', AddressController.getUserAddresses);

/**
 * @route GET /api/v1/addresses/:id
 * @desc Get specific address details by ID
 * @access Customer
 */
router.get('/:id', AddressController.getAddressById);

/**
 * @route PATCH /api/v1/addresses/:id
 * @desc Update an existing address
 * @access Customer
 */
router.patch('/:id', AddressController.updateAddress);

/**
 * @route DELETE /api/v1/addresses/:id
 * @desc Delete an address
 * @access Customer
 */
router.delete('/:id', AddressController.deleteAddress);

/**
 * @route PATCH /api/v1/addresses/:id/default
 * @desc Set address as default
 * @access Customer
 */
router.patch('/:id/default', AddressController.setDefaultAddress);

export default router;
