import { Request } from 'express';
import { ZodSchema } from 'zod';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: {
    code: string;
    details?: unknown;
  };
}

export interface RequestValidationSchema {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export type TypedRequest<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
> = Request<TParams, unknown, TBody, TQuery>;
