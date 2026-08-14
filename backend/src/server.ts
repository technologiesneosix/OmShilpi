import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { disconnectDatabase } from './config/prisma';

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Om Shilpi Backend running in [${env.NODE_ENV}] mode on port ${env.PORT}`);
  logger.info(`🏥 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('💥 UNHANDLED REJECTION! Shutting down server...');
  logger.error(reason.name, reason.message);
  server.close(async () => {
    await disconnectDatabase();
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('💥 UNCAUGHT EXCEPTION! Shutting down server...');
  logger.error(error.name, error.message);
  process.exit(1);
});

// Handle graceful shutdown signals
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await disconnectDatabase();
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
