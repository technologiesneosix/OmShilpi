import { PaginationParams, PaginationMeta } from '../types';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Safely parses request query parameters into pagination parameters.
 * Prevents negative pages, zero/negative limits, or excessively large limits.
 */
export const parsePagination = (query: Record<string, unknown>): PaginationParams => {
  const rawPage = parseInt(String(query.page), 10);
  const rawLimit = parseInt(String(query.limit), 10);

  const page = !isNaN(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  let limit = !isNaN(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_LIMIT;

  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
};

/**
 * Constructs a pagination metadata payload.
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
  };
};
