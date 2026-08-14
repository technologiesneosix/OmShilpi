import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { UserRole, UserStatus } from '@prisma/client';

export interface JwtAuthPayload {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * Generates a short-lived JWT access token.
 */
export const generateAccessToken = (payload: JwtAuthPayload): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

/**
 * Generates a long-lived JWT refresh token.
 */
export const generateRefreshToken = (payload: { userId: string }): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

/**
 * Verifies and decodes a JWT access token.
 */
export const verifyAccessToken = (token: string): JwtAuthPayload | null => {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtAuthPayload;
  } catch {
    return null;
  }
};

/**
 * Verifies and decodes a JWT refresh token.
 */
export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

/**
 * Hashes a raw token string (e.g. refresh token or password reset token) using SHA-256 for secure DB storage.
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates a cryptographically random token string for password resets.
 */
export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
