import { Router } from 'express';
import { UserRole } from '@prisma/client';
import {
  signup,
  login,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  adminTest,
} from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import {
  signupSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Public Authentication Endpoints
router.post(
  ['/signup', '/register'],
  authRateLimiter,
  validateRequest({ body: signupSchema }),
  signup
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  login
);

router.post('/logout', logout);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateRequest({ body: resetPasswordSchema }),
  resetPassword
);

// Protected User Endpoints (Requires Authentication)
router.get('/me', requireAuth, getMe);

router.patch(
  '/password',
  requireAuth,
  validateRequest({ body: changePasswordSchema }),
  changePassword
);

// Protected Admin Verification Endpoint (Requires ADMIN or SUPER_ADMIN role)
router.get(
  '/admin/test',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminTest
);

export default router;
