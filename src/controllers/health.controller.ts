import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { checkDatabaseConnection } from '../config/prisma';

export const getHealth = async (_req: Request, res: Response): Promise<void> => {
  const isDbConnected = await checkDatabaseConnection();

  const healthData = {
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Om Shilpi Jewellers Backend',
    version: '1.0.0',
    database: isDbConnected ? 'connected' : 'disconnected',
  };

  if (!isDbConnected) {
    ApiResponse.error(
      res,
      'API is operating in a degraded state: Database unreachable',
      503,
      'DATABASE_UNAVAILABLE',
      healthData
    );
    return;
  }

  ApiResponse.success(
    res,
    'API is healthy',
    healthData,
    200
  );
};
