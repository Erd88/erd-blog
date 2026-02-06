import express from 'express';
import cors from 'cors';
import { config, validateConfig } from './config.js';
import { getDb } from './db/connection.js';
import { initializeDatabase } from './db/schema.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityMiddleware, requestLogger, healthCheck } from './middleware/security.js';
import { apiRateLimiter, authRateLimiter, contactRateLimiter, adminRateLimiter } from './middleware/rateLimiter.js';

// Routes
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import commentsRoutes from './routes/comments.js';
import categoriesRoutes from './routes/categories.js';
import usersRoutes from './routes/users.js';
import contactRoutes from './routes/contact.js';
import feedRoutes from './routes/feed.js';
import statsRoutes from './routes/stats.js';

async function main() {
  try {
    // Validate configuration before starting
    validateConfig();
    
    // Initialize database
    await getDb();
    await initializeDatabase();
    console.log('✅ Database initialized');

    const app = express();

    // Security middleware (must be first)
    app.use(securityMiddleware());
    
    // Request logging
    if (!config.isTest) {
      app.use(requestLogger);
    }
    
    // CORS configuration
    app.use(cors({ 
      origin: config.corsOrigin, 
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));
    
    // Body parsing
    app.use(express.json({ 
      limit: '5mb',
      strict: true,
    }));
    app.use(express.urlencoded({ extended: true, limit: '5mb' }));

    // Health check endpoint (no rate limiting)
    app.get('/health', healthCheck);

    // Apply general rate limiting to all API routes
    app.use('/api', apiRateLimiter);

    // Routes with specific rate limiting
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

    // 404 handler (must be after all routes)
    app.use(notFoundHandler);
    
    // Global error handler (must be last)
    app.use(errorHandler);

    // Start server
    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.port}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('💥 Unhandled Rejection:', reason);
  process.exit(1);
});

main();
