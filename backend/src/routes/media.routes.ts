import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { uploadSingleImage, handleUploadError } from '../middleware/upload.middleware';
import { MediaController } from '../controllers/media.controller';

const router = Router({ mergeParams: true });

// Require ADMIN or SUPER_ADMIN authorization for all media mutations
router.use(requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'));

/**
 * @route POST /api/v1/admin/products/:productId/images
 * @desc Upload product image
 * @access Admin / Super Admin
 */
router.post(
  '/:productId/images',
  uploadSingleImage,
  handleUploadError,
  MediaController.uploadProductImage
);

/**
 * @route GET /api/v1/admin/products/:productId/images
 * @desc List all images for a product
 * @access Admin / Super Admin
 */
router.get(
  '/:productId/images',
  MediaController.getProductImages
);

/**
 * @route PATCH /api/v1/admin/products/:productId/images/reorder
 * @desc Reorder product images
 * @access Admin / Super Admin
 * NOTE: Register static route /reorder BEFORE /:imageId to prevent route collision!
 */
router.patch(
  '/:productId/images/reorder',
  MediaController.reorderImages
);

/**
 * @route PATCH /api/v1/admin/products/:productId/images/:imageId/primary
 * @desc Set image as primary
 * @access Admin / Super Admin
 */
router.patch(
  '/:productId/images/:imageId/primary',
  MediaController.setPrimaryImage
);

/**
 * @route PATCH /api/v1/admin/products/:productId/images/:imageId
 * @desc Update image metadata (altText, sortOrder)
 * @access Admin / Super Admin
 */
router.patch(
  '/:productId/images/:imageId',
  MediaController.updateImageMetadata
);

/**
 * @route DELETE /api/v1/admin/products/:productId/images/:imageId
 * @desc Delete product image
 * @access Admin / Super Admin
 */
router.delete(
  '/:productId/images/:imageId',
  MediaController.deleteProductImage
);

/**
 * @route PUT /api/v1/admin/products/:productId/images/:imageId/replace
 * @desc Replace image file asset
 * @access Admin / Super Admin
 */
router.put(
  '/:productId/images/:imageId/replace',
  uploadSingleImage,
  handleUploadError,
  MediaController.replaceProductImage
);

export default router;
