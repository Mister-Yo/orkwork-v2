import { Hono } from 'hono';
import { db } from '../db';
import { sql } from 'drizzle-orm';

const app = new Hono();

// Start time for uptime calculation
const startTime = Date.now();

// GET /api/health - Health check endpoint
app.get('/', async (c) => {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    
    // Basic health check response
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime,
      version: process.env.npm_package_version || '2.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // If detailed health check is requested
    const detailed = c.req.query('detailed');
    
    if (detailed === 'true') {
      const checks = {
        database: await checkDatabase(),
        memory: checkMemory(),
        env: checkEnvironment(),
      };

      return c.json({
        ...health,
        checks,
        healthy: Object.values(checks).every(check => check.status === 'ok'),
      });
    }

    return c.json(health);
  } catch (error) {
    console.error('Health check error:', error);
    return c.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 500);
  }
});

// Database connectivity check
async function checkDatabase() {
  try {
    const result = await sql`SELECT 1 as test`;
    return {
      status: 'ok',
      message: 'Database connected',
      responseTime: null, // Could add timing if needed
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Memory usage check
function checkMemory() {
  try {
    const memUsage = process.memoryUsage();
    const mbUsed = Math.round(memUsage.heapUsed / 1024 / 1024);
    const mbTotal = Math.round(memUsage.heapTotal / 1024 / 1024);
    
    return {
      status: 'ok',
      heapUsed: `${mbUsed} MB`,
      heapTotal: `${mbTotal} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)} MB`,
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Memory check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Environment variables check
function checkEnvironment() {
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'SESSION_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    return {
      status: 'error',
      message: 'Missing required environment variables',
      missing,
    };
  }

  return {
    status: 'ok',
    message: 'All required environment variables present',
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}

// GET /api/health/ready - Kubernetes readiness probe
app.get('/ready', async (c) => {
  try {
    // Check if the app is ready to serve traffic
    await checkDatabase();
    
    return c.json({ status: 'ready' });
  } catch (error) {
    return c.json({ status: 'not ready', error: error instanceof Error ? error.message : 'Unknown error' }, 503);
  }
});

// GET /api/health/live - Kubernetes liveness probe
app.get('/live', (c) => {
  // Simple liveness check - if we can respond, we're alive
  return c.json({ status: 'alive' });
});

export default app;