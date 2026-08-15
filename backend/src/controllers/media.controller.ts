import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { MediaService } from '../services/media.service';
import {
  uploadImageBodySchema,
  updateImageMetadataSchema,
  reorderImagesSchema,
  productIdParamSchema,
  productImageParamsSchema,
} from '../validators/media.validator';

export class MediaController {
  /**
   * Uploads product image (Admin).
   * POST /api/v1/admin/products/:productId/images
   */
  static uploadProductImage = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = productIdParamSchema.parse(req.params);

    if (!req.file) {
      throw ApiError.badRequest('No image file uploaded in field "image"', 'NO_FILE_UPLOADED');
    }

    const body = uploadImageBodySchema.parse(req.body);
    const image = await MediaService.uploadProductImage(
      productId,
      req.file.buffer,
      body
    );

    return ApiResponse.success(res, 'Product image uploaded successfully', { image }, 201);
  });

  /**
   * Lists product images (Admin).
   * GET /api/v1/admin/products/:productId/images
   */
  static getProductImages = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = productIdParamSchema.parse(req.params);
    const images = await MediaService.getProductImages(productId);

    return ApiResponse.success(res, 'Product images retrieved successfully', { images });
  });

  /**
   * Sets primary image for a product (Admin).
   * PATCH /api/v1/admin/products/:productId/images/:imageId/primary
   */
  static setPrimaryImage = asyncHandler(async (req: Request, res: Response) => {
    const { productId, imageId } = productImageParamsSchema.parse(req.params);
    const image = await MediaService.setPrimaryImage(productId, imageId);

    return ApiResponse.success(res, 'Primary product image updated successfully', { image });
  });

  /**
   * Reorders product images (Admin).
   * PATCH /api/v1/admin/products/:productId/images/reorder
   */
  static reorderImages = asyncHandler(async (req: Request, res: Response) => {
    const { productId } = productIdParamSchema.parse(req.params);
    const body = reorderImagesSchema.parse(req.body);
    const images = await MediaService.reorderImages(productId, body.imageIds);

    return ApiResponse.success(res, 'Product images reordered successfully', { images });
  });

  /**
   * Updates product image metadata (Admin).
   * PATCH /api/v1/admin/products/:productId/images/:imageId
   */
  static updateImageMetadata = asyncHandler(async (req: Request, res: Response) => {
    const { productId, imageId } = productImageParamsSchema.parse(req.params);
    const body = updateImageMetadataSchema.parse(req.body);
    const image = await MediaService.updateImageMetadata(productId, imageId, body);

    return ApiResponse.success(res, 'Product image metadata updated successfully', { image });
  });

  /**
   * Deletes product image (Admin).
   * DELETE /api/v1/admin/products/:productId/images/:imageId
   */
  static deleteProductImage = asyncHandler(async (req: Request, res: Response) => {
    const { productId, imageId } = productImageParamsSchema.parse(req.params);
    await MediaService.deleteProductImage(productId, imageId);

    return ApiResponse.success(res, 'Product image deleted successfully');
  });

  /**
   * Replaces product image file (Admin).
   * PUT /api/v1/admin/products/:productId/images/:imageId/replace
   */
  static replaceProductImage = asyncHandler(async (req: Request, res: Response) => {
    const { productId, imageId } = productImageParamsSchema.parse(req.params);

    if (!req.file) {
      throw ApiError.badRequest('No replacement image file uploaded in field "image"', 'NO_FILE_UPLOADED');
    }

    const image = await MediaService.replaceProductImage(
      productId,
      imageId,
      req.file.buffer
    );

    return ApiResponse.success(res, 'Product image replaced successfully', { image });
  });
}
