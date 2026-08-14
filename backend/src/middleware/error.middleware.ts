import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../config/logger';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let details: unknown = undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
    details = err.details;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Map known Prisma errors to safe user-friendly application errors
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        errorCode = 'CONFLICT';
        const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
        message = `A resource with this ${target} already exists`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        errorCode = 'NOT_FOUND';
        message = 'Requested record was not found';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        errorCode = 'FOREIGN_KEY_VIOLATION';
        message = 'Referenced entity constraint failed';
        break;
      }
      default: {
        statusCode = 500;
        errorCode = 'DATABASE_ERROR';
        message = 'Database operation failed';
        logger.error(`[Prisma Known Error ${err.code}] ${err.message}`, { meta: err.meta });
        break;
      }
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    errorCode = 'BAD_REQUEST';
    message = 'Invalid data provided for database operation';
    logger.error(`[Prisma Validation Error] ${err.message}`);
  } else {
    // Log unexpected non-Prisma errors
    logger.error(`[Unhandled Error] ${err.message}`, { stack: err.stack });
  }

  // Prevent leakage of stack traces or detailed internals in production
  const isProduction = env.NODE_ENV === 'production';
  const responseMessage = isProduction && statusCode === 500
    ? 'An unexpected error occurred on the server'
    : message;

  ApiResponse.error(res, responseMessage, statusCode, errorCode, details);
};
