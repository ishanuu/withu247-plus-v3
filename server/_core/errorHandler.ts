/**
 * Comprehensive Error Handling
 * Provides centralized error handling and logging
 */

import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  details?: Record<string, any>;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = err instanceof AppError ? err : new AppError(500, err.message);

  const errorResponse: ErrorResponse = {
    success: false,
    error: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Log error
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    // In production, log to external service
    console.error(`[${error.statusCode}] ${error.message}`);
  }

  res.status(error.statusCode).json(errorResponse);
};

/**
 * Async error wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Common error constructors
 */
export const errors = {
  notFound: (resource: string) =>
    new AppError(404, `${resource} not found`),

  unauthorized: () =>
    new AppError(401, 'Unauthorized access'),

  forbidden: () =>
    new AppError(403, 'Forbidden'),

  badRequest: (message: string) =>
    new AppError(400, message),

  conflict: (message: string) =>
    new AppError(409, message),

  tooManyRequests: () =>
    new AppError(429, 'Too many requests'),

  internalServer: (message: string = 'Internal server error') =>
    new AppError(500, message),

  serviceUnavailable: () =>
    new AppError(503, 'Service temporarily unavailable'),

  validationError: (field: string, message: string) =>
    new AppError(400, `Validation error: ${field} - ${message}`),

  authenticationFailed: () =>
    new AppError(401, 'Authentication failed'),

  permissionDenied: () =>
    new AppError(403, 'Permission denied'),

  resourceExists: (resource: string) =>
    new AppError(409, `${resource} already exists`),
};

/**
 * Validation error handler
 */
export const handleValidationError = (errors: any[]): AppError => {
  const message = errors.map((e) => `${e.field}: ${e.message}`).join(', ');
  return new AppError(400, `Validation failed: ${message}`);
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error: any): AppError => {
  if (error.code === 'ER_DUP_ENTRY') {
    return new AppError(409, 'Duplicate entry');
  }
  if (error.code === 'ER_NO_REFERENCED_ROW') {
    return new AppError(400, 'Invalid reference');
  }
  return new AppError(500, 'Database error');
};

/**
 * External API error handler
 */
export const handleExternalApiError = (error: any): AppError => {
  if (error.response?.status === 404) {
    return new AppError(404, 'External resource not found');
  }
  if (error.response?.status === 401) {
    return new AppError(401, 'External API authentication failed');
  }
  if (error.response?.status === 429) {
    return new AppError(429, 'External API rate limit exceeded');
  }
  return new AppError(503, 'External service unavailable');
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    statusCode: 404,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

export default {
  AppError,
  errorHandler,
  asyncHandler,
  errors,
  handleValidationError,
  handleDatabaseError,
  handleExternalApiError,
  notFoundHandler,
};
