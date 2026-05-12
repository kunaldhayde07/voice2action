import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.utils';

export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 'Too many requests. Please try again later.', 429);
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    sendError(res, 'Too many login attempts. Please try again in 15 minutes.', 429);
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  message: 'Upload limit reached. Please try again later.',
  handler: (_req, res) => {
    sendError(res, 'Upload limit reached. Please try again in 1 hour.', 429);
  },
});

export const voteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  handler: (_req, res) => {
    sendError(res, 'Too many voting requests. Please slow down.', 429);
  },
});