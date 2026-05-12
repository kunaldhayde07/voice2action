import { PaginationOptions, PaginatedResult } from '../types';

export const getPaginationOptions = (
  query: Record<string, string | undefined>
): PaginationOptions => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(query.limit || '10', 10)));
  const sort = query.sort || '-createdAt';

  return { page, limit, sort };
};

export const createPaginatedResult = <T>(
  data: T[],
  total: number,
  options: PaginationOptions
): PaginatedResult<T> => {
  const pages = Math.ceil(total / options.limit);

  return {
    data,
    pagination: {
      total,
      page: options.page,
      limit: options.limit,
      pages,
      hasNext: options.page < pages,
      hasPrev: options.page > 1,
    },
  };
};