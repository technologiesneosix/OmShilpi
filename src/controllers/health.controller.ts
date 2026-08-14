import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const getHealth = (_req: Request, res: Response): void => {
  ApiResponse.success(
    res,
    'API is healthy',
    {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      service: 'Om Shilpi Jewellers Backend',
      version: '1.0.0',
    },
    200
  );
};
