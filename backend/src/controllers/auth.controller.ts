import { Request, Response } from 'express';
import { CookieOptions } from 'express';
import { env } from '../config/env';
import { AuthService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const getCookieOptions = (expiresInMs: number): CookieOptions => ({
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
  maxAge: expiresInMs,
});

const ACCESS_COOKIE_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.signup(req.body);

  // Set HttpOnly authentication cookies
  res.cookie(env.COOKIE_NAME, result.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie(env.REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

  ApiResponse.success(res, 'Account created successfully', { user: result.user }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  // Set HttpOnly authentication cookies
  res.cookie(env.COOKIE_NAME, result.accessToken, getCookieOptions(ACCESS_COOKIE_MAX_AGE));
  res.cookie(env.REFRESH_COOKIE_NAME, result.refreshToken, getCookieOptions(REFRESH_COOKIE_MAX_AGE));

  ApiResponse.success(res, 'Login successful', { user: result.user }, 200);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenRaw = req.cookies?.[env.REFRESH_COOKIE_NAME];

  await AuthService.logout(refreshTokenRaw);

  // Clear authentication cookies
  res.clearCookie(env.COOKIE_NAME, { path: '/' });
  res.clearCookie(env.REFRESH_COOKIE_NAME, { path: '/' });

  ApiResponse.success(res, 'Logged out successfully', undefined, 200);
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  ApiResponse.success(res, 'Current user profile retrieved', { user: req.user }, 200);
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return;
  }

  await AuthService.changePassword(req.user.id, req.body);

  // Clear cookies on password change to force re-authentication
  res.clearCookie(env.COOKIE_NAME, { path: '/' });
  res.clearCookie(env.REFRESH_COOKIE_NAME, { path: '/' });

  ApiResponse.success(res, 'Password changed successfully. Please log in again.', undefined, 200);
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body);
  ApiResponse.success(res, result.message, result.devToken ? { devToken: result.devToken } : undefined, 200);
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);
  ApiResponse.success(res, 'Password reset successfully. Please log in with your new password.', undefined, 200);
});

export const adminTest = asyncHandler(async (req: Request, res: Response) => {
  ApiResponse.success(
    res,
    'Admin authorization test passed',
    {
      message: 'Access granted to administrator route',
      user: req.user,
    },
    200
  );
});
