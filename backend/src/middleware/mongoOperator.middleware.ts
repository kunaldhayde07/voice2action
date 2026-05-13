import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';

const FORBIDDEN_GEO_OPERATORS = new Set([
  '$geoNear',
  '$near',
  '$nearSphere',
]);

const hasForbiddenGeoOperator = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false;

  if (Array.isArray(value)) {
    return value.some(hasForbiddenGeoOperator);
  }

  return Object.entries(value as Record<string, unknown>).some(
    ([key, entry]) =>
      FORBIDDEN_GEO_OPERATORS.has(key) || hasForbiddenGeoOperator(entry)
  );
};

export const rejectForbiddenGeoOperators = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (
    hasForbiddenGeoOperator(req.query) ||
    hasForbiddenGeoOperator(req.body) ||
    hasForbiddenGeoOperator(req.params)
  ) {
    sendError(res, 'Unsupported geospatial operator in request', 400);
    return;
  }

  next();
};
