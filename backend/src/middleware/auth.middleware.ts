import { Request, Response, NextFunction } from 'express';
import { UserRole, UserStatus } from '@prisma/client';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { verifyAccessToken } from '../utils/tokens';
import { ApiError } from '../utils/apiError';

/**
 * Middleware requiring a valid, active user authentication token.
 * Inspects HttpOnly cookies first (`env.COOKIE_NAME`), then authorization header fallback.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      const rawToken = req.headers.authorization.slice(7).trim();
      token = rawToken.replace(/["'\s\n\r\t]/g, '');
    }

    if (!token && req.cookies?.[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication required', 'UNAUTHENTICATED');
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      throw ApiError.unauthorized('Invalid or expired authentication token', 'TOKEN_EXPIRED');
    }

    // Verify user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!user) {
      throw ApiError.unauthorized('Authenticated user no longer exists', 'USER_NOT_FOUND');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.forbidden('Your account is not active', 'ACCOUNT_INACTIVE');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware restricting access to specified user roles.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required', 'UNAUTHENTICATED'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        ApiError.forbidden(
          'You do not have permission to perform this action',
          'FORBIDDEN'
        )
      );
      return;
    }

    next();
  };
};
