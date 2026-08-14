import { Response } from 'express';
import { ApiResponsePayload, PaginationMeta } from '../types';

export class ApiResponse {
  static success<T>(
    res: Response,
    message: string,
    data?: T,
    statusCode: number = 200
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
    };

    if (data !== undefined) {
      payload.data = data;
    }

    return res.status(statusCode).json(payload);
  }

  static paginated<T>(
    res: Response,
    message: string,
    data: T[],
    meta: PaginationMeta,
    statusCode: number = 200
  ): Response {
    const payload: ApiResponsePayload<T[]> = {
      success: true,
      message,
      data,
      meta,
    };

    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_SERVER_ERROR',
    details?: unknown
  ): Response {
    const payload: ApiResponsePayload = {
      success: false,
      message,
      error: {
        code: errorCode,
        ...(details !== undefined ? { details } : {}),
      },
    };

    return res.status(statusCode).json(payload);
  }
}
