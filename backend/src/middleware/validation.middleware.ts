import { Request, Response, NextFunction } from 'express';
import { RequestValidationSchema } from '../types';
import { ApiError } from '../utils/apiError';

/**
 * Reusable Express middleware for validating request body, query, and params using Zod schemas.
 * Returns a standardized 400 Bad Request error if validation fails.
 */
export const validateRequest = (schema: RequestValidationSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationErrors: Array<{ field: string; message: string }> = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          validationErrors.push({
            field: `body.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          validationErrors.push({
            field: `query.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        result.error.issues.forEach((issue) => {
          validationErrors.push({
            field: `params.${issue.path.join('.')}`,
            message: issue.message,
          });
        });
      }
    }

    if (validationErrors.length > 0) {
      next(ApiError.validation('Validation failed', validationErrors));
      return;
    }

    next();
  };
};
