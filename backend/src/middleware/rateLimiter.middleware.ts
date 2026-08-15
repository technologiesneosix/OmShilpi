import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';
import { env } from '../config/env';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: env.NODE_ENV === 'production' ? 20 : 500, // Generous limit in dev/test for test suite automation
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
