import { SortOptions } from '../types';

/**
 * Safely parses and validates sorting parameters against a strict whitelist of allowed fields.
 * Prevents arbitrary Prisma field injection or invalid sorting clauses.
 */
export const parseSort = (
  sortParam: unknown,
  allowedFields: string[],
  defaultField: string = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): SortOptions => {
  if (typeof sortParam !== 'string' || !sortParam.trim()) {
    return { field: defaultField, order: defaultOrder };
  }

  const [field, rawOrder] = sortParam.split(':');
  const isAllowed = allowedFields.includes(field);
  const order: 'asc' | 'desc' = rawOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

  return {
    field: isAllowed ? field : defaultField,
    order: isAllowed ? order : defaultOrder,
  };
};
