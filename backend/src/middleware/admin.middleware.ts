import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.utils';

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    sendError(res, 'Access denied. Admin privileges required.', 403);
    return;
  }

  next();
};

export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    sendError(res, 'Authentication required.', 401);
    return;
  }

  if (req.user.role !== 'super_admin') {
    sendError(res, 'Access denied. Super admin privileges required.', 403);
    return;
  }

  next();
};