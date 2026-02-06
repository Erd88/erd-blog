import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config.js';

/**
 * Custom API Error class
 * Use this for operational errors that should be sent to the client
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    details?: Record<string, unknown> | Array<{ field: string; message: string }>;
    stack?: string;
    requestId?: string;
  };
}

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format Zod validation errors for response
 */
function formatZodErrors(error: ZodError): Array<{ field: string; message: string }> {
  return error.errors.map((e) => ({
    field: e.path.join('.'),
    message: e.message,
  }));
}

/**
 * Main error handling middleware
 * Catches all errors and sends appropriate responses
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = generateRequestId();
  const timestamp = new Date().toISOString();
  
  // Log the error for monitoring
  console.error(`[${timestamp}] [${requestId}] Error:`, {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  
  // Handle known error types
  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      error: {
        message: err.message,
        code: err.code || 'API_ERROR',
        requestId,
      },
    };
    
    if (err.details) {
      response.error.details = err.details;
    }
    
    // Only include stack trace in development
    if (config.isDevelopment) {
      response.error.stack = err.stack;
    }
    
    res.status(err.statusCode).json(response);
    return;
  }
  
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: formatZodErrors(err),
        requestId,
      },
    };
    
    if (config.isDevelopment) {
      response.error.stack = err.stack;
    }
    
    res.status(400).json(response);
    return;
  }
  
  // Handle syntax errors (invalid JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    const response: ErrorResponse = {
      error: {
        message: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
        requestId,
      },
    };
    
    res.status(400).json(response);
    return;
  }
  
  // Handle unhandled errors
  // Don't leak internal error details in production
  const response: ErrorResponse = {
    error: {
      message: config.isProduction 
        ? 'An unexpected error occurred' 
        : err.message,
      code: 'INTERNAL_ERROR',
      requestId,
    },
  };
  
  if (config.isDevelopment) {
    response.error.stack = err.stack;
  }
  
  res.status(500).json(response);
}

/**
 * 404 Not Found handler
 * Should be placed after all other routes
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = generateRequestId();
  
  res.status(404).json({
    error: {
      message: `Route ${req.method} ${req.path} not found`,
      code: 'NOT_FOUND',
      requestId,
    },
  });
}

/**
 * Async handler wrapper
 * Catches errors in async route handlers and passes them to error handler
 * 
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
