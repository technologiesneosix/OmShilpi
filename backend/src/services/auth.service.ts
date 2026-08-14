import { UserRole, UserStatus } from '@prisma/client';
import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRandomToken,
  hashToken,
  JwtAuthPayload,
} from '../utils/tokens';
import { ApiError } from '../utils/apiError';
import {
  SignupInput,
  LoginInput,
  ChangePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../validators/auth.validator';
import { AuthUserPayload } from '../types';

export class AuthService {
  /**
   * Registers a new customer account. Public signup strictly enforces role: CUSTOMER.
   */
  static async signup(input: SignupInput): Promise<{
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
  }> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);

    // Create user strictly with CUSTOMER role regardless of client input
    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        phone: input.phone ? input.phone.trim() : null,
        passwordHash,
        role: UserRole.CUSTOMER,
        status: UserStatus.ACTIVE,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    // Generate tokens & persist refresh token
    const tokens = await this.createAuthSession(user);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Authenticates a user. Returns generic error on invalid credentials to prevent email enumeration.
   */
  static async login(input: LoginInput): Promise<{
    user: AuthUserPayload;
    accessToken: string;
    refreshToken: string;
  }> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Generic invalid credentials error for both nonexistent email and wrong password
    if (!user) {
      throw ApiError.unauthorized('Invalid email address or password', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email address or password', 'INVALID_CREDENTIALS');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.forbidden('Your account is not active. Please contact support.', 'ACCOUNT_INACTIVE');
    }

    const safeUser: AuthUserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };

    const tokens = await this.createAuthSession(safeUser);

    return {
      user: safeUser,
      ...tokens,
    };
  }

  /**
   * Revokes the active refresh token in database on logout.
   */
  static async logout(refreshTokenRaw?: string): Promise<void> {
    if (!refreshTokenRaw) return;

    const tokenHash = hashToken(refreshTokenRaw);
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  /**
   * Changes authenticated user's password and revokes active sessions.
   */
  static async changePassword(
    userId: string,
    input: ChangePasswordInput
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw ApiError.notFound('User account not found');
    }

    const isPasswordValid = await comparePassword(input.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect', 'INVALID_CURRENT_PASSWORD');
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Invalidate existing refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Generates a password reset token and stores its SHA-256 hash in DB.
   * Returns a generic message to prevent account enumeration.
   */
  static async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string; devToken?: string }> {
    const normalizedEmail = input.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const genericResponse = {
      message: 'If an account with that email exists, a password reset link has been processed.',
    };

    if (!user || user.status !== UserStatus.ACTIVE) {
      return genericResponse;
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    await prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    // In development mode only, return devToken for non-destructive local testing
    return {
      ...genericResponse,
      ...(process.env.NODE_ENV === 'development' ? { devToken: rawToken } : {}),
    };
  }

  /**
   * Resets password using a valid, non-expired, un-used reset token.
   */
  static async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenHash = hashToken(input.token);

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !resetTokenRecord ||
      resetTokenRecord.usedAt !== null ||
      resetTokenRecord.expiresAt < new Date()
    ) {
      throw ApiError.badRequest('Invalid or expired password reset token', 'INVALID_RESET_TOKEN');
    }

    const newPasswordHash = await hashPassword(input.newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetTokenRecord.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: resetTokenRecord.userId },
        data: { isRevoked: true },
      }),
    ]);
  }

  /**
   * Helper method to generate access and refresh tokens and persist refresh token hash.
   */
  private static async createAuthSession(user: AuthUserPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const authPayload: JwtAuthPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    const accessToken = generateAccessToken(authPayload);
    const refreshToken = generateRefreshToken({ userId: user.id });
    const tokenHash = hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
