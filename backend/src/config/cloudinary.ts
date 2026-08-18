import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { env } from './env';
import { logger } from './logger';
import { ApiError } from '../utils/apiError';

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('☁️ Cloudinary SDK configured successfully');
} else {
  logger.warn('⚠️ Cloudinary environment variables missing. Operating in fallback mock mode for testing.');
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

/**
 * Uploads an in-memory buffer to Cloudinary (or returns mock asset in fallback mode).
 */
export const uploadToCloudinaryBuffer = async (
  buffer: Buffer,
  filenameHint?: string
): Promise<CloudinaryUploadResult> => {
  if (!isConfigured) {
    const mockId = `om-shilpi/products/mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockUrl = `https://res.cloudinary.com/om-shilpi/image/upload/v${Date.now()}/${mockId}.jpg`;
    return {
      secureUrl: mockUrl,
      publicId: mockId,
    };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.CLOUDINARY_FOLDER || 'om-shilpi/products',
        asset_folder: env.CLOUDINARY_FOLDER || 'om-shilpi/products',
        use_asset_folder: true,
        tags: env.CLOUDINARY_FOLDER ? [env.CLOUDINARY_FOLDER] : undefined,
        resource_type: 'image',
        public_id: filenameHint ? `${filenameHint}_${Date.now()}` : undefined,
        overwrite: false,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          logger.error('Cloudinary upload stream error:', error);
          return reject(ApiError.internal('Failed to upload image asset to Cloudinary', 'CLOUDINARY_UPLOAD_FAILED'));
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
        });
      }
    );
    uploadStream.end(buffer);
  });
};

/**
 * Deletes an image asset from Cloudinary by publicId.
 */
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!isConfigured || !publicId || publicId.startsWith('om-shilpi/products/mock_')) {
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    logger.error(`Failed to delete Cloudinary asset with publicId '${publicId}':`, error);
    return false;
  }
};

export { cloudinary };
