import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Create a standardized rate limit response
 */
function createRateLimitResponse(windowMs: number) {
  return (req: Request, res: Response) => {
    const retryAfter = Math.ceil(windowMs / 1000);
    res.status(429).json({
      error: {
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      },
    });
  };
}

/**
 * Strict rate limiter for contact form submissions
 * Prevents spam and abuse
 */
export const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: createRateLimitResponse(15 * 60 * 1000),
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  keyGenerator: (req: Request) => {
    // Use IP + email combination for contact form to prevent same email spam
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const email = req.body?.email || '';
    return `${ip}:${email}`;
  },
  skip: () => process.env.NODE_ENV === 'test', // Skip in test environment
});

/**
 * Rate limiter for authentication endpoints
 * Prevents brute force attacks
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per window
  message: createRateLimitResponse(15 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // Use IP for auth rate limiting
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: () => process.env.NODE_ENV === 'test',
});

/**
 * General API rate limiter
 * Applied to all API routes
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: createRateLimitResponse(15 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    if (req.path === '/health') return true;
    // Skip in test environment
    if (process.env.NODE_ENV === 'test') return true;
    return false;
  },
});

/**
 * Stricter rate limiter for admin endpoints
 * Extra protection for sensitive operations
 */
export const adminRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window (more strict than general)
  message: createRateLimitResponse(15 * 60 * 1000),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  skip: () => process.env.NODE_ENV === 'test',
});
