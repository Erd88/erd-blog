import { z } from 'zod';

/**
 * Environment variable schema with validation
 * Ensures all required environment variables are present and valid
 */
const envSchema = z.object({
  // Server configuration
  PORT: z.string()
    .transform((val) => parseInt(val, 10))
    .default('3001'),
  
  NODE_ENV: z.enum(['development', 'production', 'test'])
    .default('development'),
  
  // Security
  JWT_SECRET: z.string()
    .min(1, 'JWT_SECRET is required')
    .refine(
      (val) => {
        // In production, JWT_SECRET should be at least 32 characters
        if (process.env.NODE_ENV === 'production') {
          return val.length >= 32;
        }
        return true;
      },
      {
        message: 'JWT_SECRET must be at least 32 characters in production',
      }
    ),
  
  // CORS
  CORS_ORIGIN: z.string()
    .url()
    .default('http://localhost:5173'),
  
  // Database
  DATABASE_URL: z.string()
    .optional(),
  
  // Optional: Email configuration for notifications
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Optional: Admin email for notifications
  ADMIN_EMAIL: z.string().email().optional(),
});

/**
 * Parse and validate environment variables
 */
function parseEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

const env = parseEnv();

/**
 * Application configuration object
 * Use this instead of direct process.env access
 */
export const config = {
  // Server
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  // Security
  jwtSecret: env.JWT_SECRET,
  corsOrigin: env.CORS_ORIGIN,
  
  // Database
  databaseUrl: env.DATABASE_URL,
  
  // Email
  smtp: env.SMTP_HOST ? {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  } : null,
  adminEmail: env.ADMIN_EMAIL,
  
  // App metadata
  appName: process.env.npm_package_name || 'blog-server',
  appVersion: process.env.npm_package_version || '1.0.0',
} as const;

/**
 * Validate critical configuration on startup
 */
export function validateConfig(): void {
  const warnings: string[] = [];
  
  if (config.isProduction) {
    // Production-specific validations
    if (config.jwtSecret === 'dev-secret-change-in-production') {
      throw new Error(
        'FATAL: Default JWT_SECRET detected in production. ' +
        'Please set a strong JWT_SECRET environment variable.'
      );
    }
    
    if (config.corsOrigin === 'http://localhost:5173') {
      warnings.push('CORS_ORIGIN is set to localhost in production');
    }
    
    if (!config.databaseUrl) {
      warnings.push('DATABASE_URL not set, using default SQLite location');
    }
  }
  
  // Log configuration status
  console.log(`🔧 Configuration loaded (${config.nodeEnv} mode)`);
  
  if (warnings.length > 0) {
    console.warn('⚠️  Configuration warnings:');
    warnings.forEach((w) => console.warn(`   - ${w}`));
  }
}
