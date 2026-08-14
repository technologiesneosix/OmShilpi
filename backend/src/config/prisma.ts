import { PrismaClient, Prisma } from '@prisma/client';
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

/**
 * Executes a sequence of database operations within an interactive Prisma transaction.
 */
export const executeTransaction = async <T>(
  action: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: { maxWait?: number; timeout?: number }
): Promise<T> => {
  return prisma.$transaction(action, options);
};

/**
 * Gracefully disconnects the Prisma client connection pool.
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    logger.info('Prisma Client disconnected cleanly.');
  } catch (error) {
    logger.error('Error disconnecting Prisma Client:', { error });
  }
};
