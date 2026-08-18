import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: env.NODE_ENV === 'production' ? 20 : 500, // Stricter limit in production, test automation friendly in dev
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many authentication attempts. Please try again later.',
      429,
      'TOO_MANY_REQUESTS'
    );
  },
});

export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: env.NODE_ENV === 'production' ? 10 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many contact enquiries submitted. Please try again later.',
      429,
      'TOO_MANY_REQUESTS'
    );
  },
});

export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: env.NODE_ENV === 'production' ? 30 : 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponse.error(
      res,
      'Too many payment verification requests. Please try again later.',
      429,
      'TOO_MANY_REQUESTS'
    );
  },
});
