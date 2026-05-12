import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.utils';
import User from '../models/User.model';
import { sendError } from '../utils/response.utils';
import logger from '../utils/logger';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check cookie
    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      sendError(res, 'Authentication required. Please log in.', 401);
      return;
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      sendError(res, 'User not found. Please log in again.', 401);
      return;
    }

    if (!user.isActive) {
      sendError(res, 'Your account has been deactivated.', 403);
      return;
    }

    req.user = user;
    next();
  } catch (error: unknown) {
    logger.error('Authentication error:', error);
    const err = error as { name?: string };
    if (err.name === 'TokenExpiredError') {
      sendError(res, 'Token expired. Please log in again.', 401);
    } else if (err.name === 'JsonWebTokenError') {
      sendError(res, 'Invalid token. Please log in again.', 401);
    } else {
      sendError(res, 'Authentication failed.', 401);
    }
  }
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch {
    // Silently fail for optional auth
  }
  next();
};