import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB limit
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];

const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const mimeType = file.mimetype.toLowerCase();
  const ext = file.originalname ? file.originalname.slice(file.originalname.lastIndexOf('.')).toLowerCase() : '';

  if (ALLOWED_MIME_TYPES.includes(mimeType) || ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type '${file.mimetype}'. Only JPEG, PNG, WebP, and AVIF images are allowed.`,
        'INVALID_IMAGE_TYPE'
      )
    );
  }
};

export const uploadSingleImage = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter,
}).single('image');

/**
 * Express error handling wrapper for Multer file upload errors.
 */
export const handleUploadError = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        ApiError.badRequest(
          `File size exceeds maximum limit of 10 MB.`,
          'FILE_TOO_LARGE'
        )
      );
    }
    return next(ApiError.badRequest(err.message, 'FILE_UPLOAD_ERROR'));
  }
  if (err) {
    return next(err);
  }
  next();
};
