import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps async Express controllers to automatically forward any rejected promises
 * to the global error handling middleware without requiring try/catch blocks.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
