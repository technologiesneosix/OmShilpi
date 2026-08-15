import { ProductImage } from '@prisma/client';
import { prisma } from '../config/prisma';
import { uploadToCloudinaryBuffer, deleteFromCloudinary } from '../config/cloudinary';
import { ApiError } from '../utils/apiError';
import { UploadImageBodyInput, UpdateImageMetadataInput } from '../validators/media.validator';

const MAX_IMAGES_PER_PRODUCT = 10;

export class MediaService {
  /**
   * Uploads product image buffer to Cloudinary and saves metadata in database.
   */
  static async uploadProductImage(
    productId: string,
    fileBuffer: Buffer,
    body: UploadImageBodyInput
  ): Promise<ProductImage> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw ApiError.notFound(`Product with ID '${productId}' not found`, 'PRODUCT_NOT_FOUND');
    }

    const existingImages = await prisma.productImage.findMany({
      where: { productId },
    });

    if (existingImages.length >= MAX_IMAGES_PER_PRODUCT) {
      throw ApiError.conflict(
        `Product image limit reached. Maximum ${MAX_IMAGES_PER_PRODUCT} images allowed per product.`,
        'IMAGE_LIMIT_REACHED'
      );
    }

    // First image uploaded is automatically marked primary
    const isFirstImage = existingImages.length === 0;
    const isPrimary = isFirstImage || Boolean(body.isPrimary);

    const filenameHint = `${product.slug || 'prod'}_${Date.now()}`;
    const cloudinaryResult = await uploadToCloudinaryBuffer(fileBuffer, filenameHint);

    try {
      return await prisma.$transaction(async (tx) => {
        if (isPrimary) {
          await tx.productImage.updateMany({
            where: { productId },
            data: { isPrimary: false },
          });
        }

        const maxSortOrder = existingImages.reduce((max, img) => Math.max(max, img.sortOrder), -1);
        const sortOrder = body.sortOrder !== undefined ? body.sortOrder : maxSortOrder + 1;

        return tx.productImage.create({
          data: {
            productId,
            url: cloudinaryResult.secureUrl,
            publicId: cloudinaryResult.publicId,
            altText: body.altText?.trim() || product.name,
            sortOrder,
            isPrimary,
          },
        });
      });
    } catch (error) {
      // Cleanup uploaded Cloudinary asset if DB insertion fails
      if (cloudinaryResult.publicId) {
        await deleteFromCloudinary(cloudinaryResult.publicId);
      }
      throw error;
    }
  }

  /**
   * Lists all product images sorted by sortOrder asc, createdAt asc.
   */
  static async getProductImages(productId: string): Promise<ProductImage[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw ApiError.notFound(`Product with ID '${productId}' not found`, 'PRODUCT_NOT_FOUND');
    }

    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Sets a specific image as the primary image for a product.
   */
  static async setPrimaryImage(productId: string, imageId: string): Promise<ProductImage> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw ApiError.notFound(`Product image with ID '${imageId}' not found for this product`, 'IMAGE_NOT_FOUND');
    }

    return prisma.$transaction(async (tx) => {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });

      return tx.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      });
    });
  }

  /**
   * Reorders product images given an ordered array of image IDs.
   */
  static async reorderImages(productId: string, imageIds: string[]): Promise<ProductImage[]> {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw ApiError.notFound(`Product with ID '${productId}' not found`, 'PRODUCT_NOT_FOUND');
    }

    const existingImages = await prisma.productImage.findMany({
      where: { productId },
    });

    const existingIds = new Set(existingImages.map((img) => img.id));
    for (const id of imageIds) {
      if (!existingIds.has(id)) {
        throw ApiError.badRequest(
          `Image ID '${id}' does not belong to product '${productId}'`,
          'INVALID_IMAGE_ORDER'
        );
      }
    }

    await prisma.$transaction(
      imageIds.map((id, index) =>
        prisma.productImage.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    );

    return prisma.productImage.findMany({
      where: { productId },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Updates metadata (altText, sortOrder) of an image.
   */
  static async updateImageMetadata(
    productId: string,
    imageId: string,
    body: UpdateImageMetadataInput
  ): Promise<ProductImage> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw ApiError.notFound(`Product image with ID '${imageId}' not found for this product`, 'IMAGE_NOT_FOUND');
    }

    return prisma.productImage.update({
      where: { id: imageId },
      data: {
        altText: body.altText !== undefined ? body.altText.trim() : undefined,
        sortOrder: body.sortOrder !== undefined ? body.sortOrder : undefined,
      },
    });
  }

  /**
   * Deletes a product image from Cloudinary and database metadata.
   */
  static async deleteProductImage(productId: string, imageId: string): Promise<void> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw ApiError.notFound(`Product image with ID '${imageId}' not found for this product`, 'IMAGE_NOT_FOUND');
    }

    if (image.publicId) {
      await deleteFromCloudinary(image.publicId);
    }

    await prisma.$transaction(async (tx) => {
      await tx.productImage.delete({
        where: { id: imageId },
      });

      // If the deleted image was primary, automatically select the next image as primary
      if (image.isPrimary) {
        const nextImage = await tx.productImage.findFirst({
          where: { productId },
          orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
          ],
        });

        if (nextImage) {
          await tx.productImage.update({
            where: { id: nextImage.id },
            data: { isPrimary: true },
          });
        }
      }
    });
  }

  /**
   * Replaces an existing image asset with a new file.
   */
  static async replaceProductImage(
    productId: string,
    imageId: string,
    fileBuffer: Buffer
  ): Promise<ProductImage> {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });
    if (!image) {
      throw ApiError.notFound(`Product image with ID '${imageId}' not found for this product`, 'IMAGE_NOT_FOUND');
    }

    const oldPublicId = image.publicId;

    const filenameHint = `replace_${Date.now()}`;
    const cloudinaryResult = await uploadToCloudinaryBuffer(fileBuffer, filenameHint);

    const updated = await prisma.productImage.update({
      where: { id: imageId },
      data: {
        url: cloudinaryResult.secureUrl,
        publicId: cloudinaryResult.publicId,
      },
    });

    if (oldPublicId) {
      await deleteFromCloudinary(oldPublicId);
    }

    return updated;
  }
}
