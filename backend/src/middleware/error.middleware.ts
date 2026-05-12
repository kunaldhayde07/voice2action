import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  path?: string;
  value?: string;
}

const handleCastError = (err: AppError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  return error;
};

const handleDuplicateKeyError = (err: AppError): AppError => {
  const field = Object.keys(err.keyValue || {})[0];
  const message = `${field} already exists. Please use a different ${field}.`;
  const error = new Error(message) as AppError;
  error.statusCode = 409;
  return error;
};

const handleValidationError = (err: mongoose.Error.ValidationError): AppError => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  const error = new Error(message) as AppError;
  error.statusCode = 400;
  return error;
};

const handleJWTError = (): AppError => {
  const error = new Error('Invalid token. Please log in again.') as AppError;
  error.statusCode = 401;
  return error;
};

const handleJWTExpiredError = (): AppError => {
  const error = new Error('Token expired. Please log in again.') as AppError;
  error.statusCode = 401;
  return error;
};

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`Error: ${err.message}`, {
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  let error = { ...err, message: err.message };

  // Handle specific MongoDB/Mongoose errors
  if (err instanceof mongoose.Error.CastError) {
    error = handleCastError(err as AppError);
  }
  if ((err as AppError).code === 11000) {
    error = handleDuplicateKeyError(err);
  }
  if (err instanceof mongoose.Error.ValidationError) {
    error = handleValidationError(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(error.statusCode || 500).json({
      status: error.status,
      message: error.message,
      stack: err.stack,
      error: err,
    });
    return;
  }

  // Production error response
  if (error.isOperational) {
    res.status(error.statusCode || 500).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};

export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}