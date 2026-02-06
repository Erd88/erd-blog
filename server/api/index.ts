import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';
import { config, validateConfig } from '../src/config.js';
import { getDb } from '../src/db/connection.js';
import { initializeDatabase } from '../src/db/schema.js';
import { errorHandler, notFoundHandler } from '../src/middleware/errorHandler.js';
import { securityMiddleware, requestLogger, healthCheck } from '../src/middleware/security.js';
import { apiRateLimiter, authRateLimiter, contactRateLimiter, adminRateLimiter } from '../src/middleware/rateLimiter.js';

// Routes
import authRoutes from '../src/routes/auth.js';
import postsRoutes from '../src/routes/posts.js';
import commentsRoutes from '../src/routes/comments.js';
import categoriesRoutes from '../src/routes/categories.js';
import usersRoutes from '../src/routes/users.js';
import contactRoutes from '../src/routes/contact.js';
import feedRoutes from '../src/routes/feed.js';
import statsRoutes from '../src/routes/stats.js';

// Initialize the app
const app = express();

// Track if database is initialized
let isInitialized = false;

async function initialize() {
  if (isInitialized) return;
  
  validateConfig();
  await getDb();
  await initializeDatabase();
  isInitialized = true;
}

// Security middleware
app.use(securityMiddleware());

// CORS
app.use(cors({ 
  origin: config.corsOrigin, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Request logging
app.use(requestLogger);

// Health check (no rate limiting)
app.get('/health', healthCheck);

// Rate limiting
app.use('/api', apiRateLimiter);

// Routes
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/contact', contactRateLimiter, contactRoutes);
app.use('/api/admin/contact', adminRateLimiter, contactRoutes);
app.use('/api/admin', adminRateLimiter);
app.use('/api/posts', postsRoutes);
app.use('/api', commentsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/admin/stats', statsRoutes);

// 404 and error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Vercel serverless handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initialize();
    return app(req, res);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ 
      error: { 
        message: 'Internal server error', 
        code: 'INTERNAL_ERROR' 
      } 
    });
  }
}
