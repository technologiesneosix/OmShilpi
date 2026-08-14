import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

declare global {
  // Allow global var in development to prevent hot-reload connection exhaustion
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Safely verifies database connectivity without exposing connection details or secrets.
 * Returns true if connected, false otherwise.
 */
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', {
      error: error instanceof Error ? error.message : 'Unknown database error',
    });
    return false;
  }
};
