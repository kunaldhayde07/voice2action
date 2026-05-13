import { PaginationOptions, PaginatedResult } from '../types';
import { getQueryNumber, getQueryString } from './query.utils';

const ALLOWED_SORT_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'priorityScore',
  'votesCount',
  'viewsCount',
  'commentsCount',
  'reputationPoints',
  'name',
  'email',
  'role',
  'isActive',
  'lastLogin',
]);

const normalizeSort = (value: unknown): string => {
  const sort = getQueryString(value)?.trim();
  if (!sort) return '-createdAt';

  const field = sort.startsWith('-') ? sort.slice(1) : sort;
  return ALLOWED_SORT_FIELDS.has(field) ? sort : '-createdAt';
};

export const getPaginationOptions = (
  query: Record<string, unknown>
): PaginationOptions => {
  const page = Math.max(1, Math.floor(getQueryNumber(query.page) || 1));
  const limit = Math.min(50, Math.max(1, Math.floor(getQueryNumber(query.limit) || 10)));
  const sort = normalizeSort(query.sort);

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
