import { Request, Response, NextFunction } from 'express';
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

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errorCode = err.errorCode;
  } else {
    // Log unexpected errors
    logger.error(`[Unhandled Error] ${err.message}`, { stack: err.stack });
  }

  // Prevent leakage of stack traces or detailed internals in production
  const isProduction = env.NODE_ENV === 'production';
  const responseMessage = isProduction && statusCode === 500
    ? 'An unexpected error occurred on the server'
    : message;

  ApiResponse.error(res, responseMessage, statusCode, errorCode);
};
