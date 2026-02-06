import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';

/**
 * Security middleware configuration using Helmet
 * Protects against common web vulnerabilities
 */
export function securityMiddleware() {
  return helmet({
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Tailwind needs unsafe-inline
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Prevent MIME type sniffing
    xContentTypeOptions: true,
    // Prevent clickjacking
    xFrameOptions: { action: 'deny' },
    // XSS Protection
    xXssProtection: true,
    // Strict Transport Security (HTTPS only in production)
    hsts: process.env.NODE_ENV === 'production' ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,
    // DNS prefetch control
    dnsPrefetchControl: { allow: false },
    // Referrer policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Hide X-Powered-By header
    hidePoweredBy: true,
    // Cross-domain policies
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginEmbedderPolicy: false, // Allow embedding images from external sources
  });
}

/**
 * Request logging middleware for debugging and monitoring
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });
  
  next();
}

/**
 * Health check middleware - adds detailed health information
 */
export function healthCheck(req: Request, res: Response) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
  };
  
  res.status(200).json(health);
}
