import { z } from 'zod';

// Environment variable schema for validation
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  
  // GitHub OAuth
  GITHUB_CLIENT_ID: z.string().min(1, 'GITHUB_CLIENT_ID is required'),
  GITHUB_CLIENT_SECRET: z.string().min(1, 'GITHUB_CLIENT_SECRET is required'),
  GITHUB_CALLBACK_URL: z.string().url('GITHUB_CALLBACK_URL must be a valid URL').optional().default('http://localhost:3001/api/auth/github/callback'),
  
  // Session/JWT
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // Server
  PORT: z.coerce.number().int().min(1).max(65535).optional().default(3001),
  
  // CORS
  CORS_ORIGIN: z.string().optional().default('http://localhost:3002'),
  
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
  
  // API URLs
  API_URL: z.string().url().optional().default('http://localhost:3001'),
  WEB_URL: z.string().url().optional().default('http://localhost:3002'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
      console.error('❌ Environment validation failed:');
      issues.forEach(issue => console.error(`  - ${issue}`));
      process.exit(1);
    }
    throw error;
  }
};

export const config = parseEnv();

// Helper functions
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

// Session configuration
export const sessionConfig = {
  secret: config.SESSION_SECRET,
  maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  secure: isProduction, // HTTPS only in production
  sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
  httpOnly: true, // XSS protection
} as const;

// GitHub OAuth URLs
export const githubConfig = {
  clientId: config.GITHUB_CLIENT_ID,
  clientSecret: config.GITHUB_CLIENT_SECRET,
  callbackUrl: config.GITHUB_CALLBACK_URL,
  authorizeUrl: 'https://github.com/login/oauth/authorize',
  tokenUrl: 'https://github.com/login/oauth/access_token',
  userUrl: 'https://api.github.com/user',
  scope: 'user:email',
} as const;

// CORS configuration
export const corsConfig = {
  origin: config.CORS_ORIGIN.split(',').map(o => o.trim()),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
} as const;