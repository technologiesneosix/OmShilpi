import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // Limit each IP to 20 auth requests per window
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
