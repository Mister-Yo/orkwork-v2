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
// GET /api/health/metrics - System metrics for monitoring dashboard
app.get('/metrics', async (c) => {
  try {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    const mem = process.memoryUsage();
    
    // DB stats
    const dbStats = await db.execute(sql`
      SELECT 
        (SELECT count(*) FROM agents WHERE status = 'active') as active_agents,
        (SELECT count(*) FROM tasks WHERE status = 'in_progress') as active_tasks,
        (SELECT count(*) FROM tasks WHERE status = 'completed' AND completed_at > NOW() - INTERVAL '24 hours') as tasks_completed_24h,
        (SELECT count(*) FROM notifications WHERE status = 'pending') as unread_notifications,
        pg_database_size(current_database()) as db_size_bytes
    `);
    
    const stats = (Array.isArray(dbStats) ? dbStats : dbStats.rows)?.[0] || {};
    
    return c.json({
      timestamp: new Date().toISOString(),
      uptime_seconds: uptime,
      process: {
        heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024),
        heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024),
        rss_mb: Math.round(mem.rss / 1024 / 1024),
        external_mb: Math.round(mem.external / 1024 / 1024),
      },
      database: {
        active_agents: Number(stats.active_agents || 0),
        active_tasks: Number(stats.active_tasks || 0),
        tasks_completed_24h: Number(stats.tasks_completed_24h || 0),
        unread_notifications: Number(stats.unread_notifications || 0),
        db_size_mb: Math.round(Number(stats.db_size_bytes || 0) / 1024 / 1024),
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
    return c.json({ error: 'Failed to collect metrics' }, 500);
  }
});
