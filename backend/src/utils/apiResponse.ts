import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: unknown;
  };
}

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
        ...(details ? { details } : {}),
      },
    };

    return res.status(statusCode).json(payload);
  }
}
