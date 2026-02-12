import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { config, corsConfig, isDevelopment } from './config';
import { authMiddleware } from './auth/middleware';

// Import route handlers
import authRoutes from './auth/github';
import agentRoutes from './routes/agents';
import apiKeyRoutes from './routes/api-keys';
import userRoutes from './routes/users';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import auditRoutes from './routes/audit';
import healthRoutes from './routes/health';
import slaRoutes from './routes/sla';
import workflowRoutes from './routes/workflows';
import costRoutes from './routes/costs';
import decisionRoutes from './routes/decisions';
import intelligenceRoutes from './routes/intelligence';
import memoryRoutes from './routes/memory';
import capabilityRoutes from './routes/capabilities';
import toolRoutes from './routes/tools';
import eventsRoutes from './routes/events';
import notificationRoutes from './routes/notifications';
import webhookRoutes from './routes/webhooks';
import deployRoutes from './routes/deploy';
import chatRoutes from './routes/chat';
import searchRoutes from './routes/search';

// Import middleware
import { auditMiddleware } from './middleware/audit';
import { authRateLimiter, apiRateLimiter, deployRateLimiter } from './middleware/rate-limit';

// Import scheduler
import { initializeScheduler, scheduler } from './engine/scheduler';

// Create main Hono app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors(corsConfig));

// Pretty JSON in development
if (isDevelopment) {
  app.use('*', prettyJSON());
}

// Auth middleware for all routes (but doesn't require authentication)
app.use('*', authMiddleware);

// Audit middleware for API routes
app.use('/api/v2/*', auditMiddleware);

// Rate limiting
app.use('/api/auth/*', authRateLimiter);
app.use('/api/v2/*', apiRateLimiter);
app.use('/api/v2/deploy/*', deployRateLimiter);

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  
  return c.json(
    {
      error: 'Internal Server Error',
      message: isDevelopment ? err.message : 'Something went wrong',
      ...(isDevelopment && { stack: err.stack }),
    },
    500
  );
});

// Not found handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    message: `Route ${c.req.method} ${c.req.path} not found`,
  }, 404);
});

// Health check routes (no auth required)
app.route('/api/health', healthRoutes);

// API root
app.get('/api', (c) => {
  return c.json({
    name: 'orkwork API',
    version: '2.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: {
        github: '/api/auth/github',
        callback: '/api/auth/github/callback',
        me: '/api/auth/me',
        logout: '/api/auth/logout',
      },
      v2: {
        agents: '/api/v2/agents',
        'agent-keys': '/api/v2/agents/:agentId/keys',
        'agent-performance': '/api/v2/agents/:id/performance',
        scopes: '/api/v2/agents/scopes',
        users: '/api/v2/users',
        projects: '/api/v2/projects',
        tasks: '/api/v2/tasks',
        executions: '/api/v2/tasks/:taskId/executions',
        audit: '/api/v2/audit',
        sla: '/api/v2/sla',
        workflows: '/api/v2/workflows',
        costs: '/api/v2/costs',
        decisions: '/api/v2/decisions',
        intelligence: {
          brief: '/api/v2/intelligence/brief',
          anomalies: '/api/v2/intelligence/anomalies',
          leaderboard: '/api/v2/intelligence/leaderboard',
          forecast: '/api/v2/intelligence/forecast',
        },
        memory: '/api/v2/agents/:agentId/memory',
        capabilities: '/api/v2/capabilities',
        'agent-capabilities': '/api/v2/agents/:agentId/capabilities',
        tools: '/api/v2/tools',
        'agent-tools': '/api/v2/agents/:agentId/tools',
        'agent-health': '/api/v2/agents/:id/health',
        'agent-heartbeat': '/api/v2/agents/:id/heartbeat',
        'agent-permissions': '/api/v2/agents/:id/permissions',
        'agent-autonomy': '/api/v2/agents/:id/autonomy',
        events: {
          stream: '/api/v2/events/stream',
          status: '/api/v2/events/status',
        },
        notifications: '/api/v2/notifications',
        'notification-unread-count': '/api/v2/notifications/unread-count',
        webhooks: '/api/v2/webhooks',
        'webhook-logs': '/api/v2/webhooks/:id/logs',
        'webhook-test': '/api/v2/webhooks/:id/test',
        deploy: {
          pull: '/api/v2/deploy/pull',
          status: '/api/v2/deploy/status',
        },
      },
    },
  });
});

// Authentication routes
app.route('/api/auth', authRoutes);

// API v2 routes
app.route('/api/v2/agents', agentRoutes);
app.route('/api/v2/agents', apiKeyRoutes); // Mount API key routes under agents path
app.route("/api/v2/api-keys", apiKeyRoutes); // Also mount at /api-keys for frontend compatibility
app.route('/api/v2/agents', memoryRoutes); // Mount memory routes under agents path
app.route('/api/v2/agents', capabilityRoutes); // Mount capability routes under agents path  
app.route('/api/v2/agents', toolRoutes); // Mount tool routes under agents path
app.route('/api/v2/capabilities', capabilityRoutes); // Also mount capabilities at root level
app.route('/api/v2/tools', toolRoutes); // Also mount tools at root level
app.route('/api/v2/users', userRoutes);
app.route('/api/v2/projects', projectRoutes);
app.route('/api/v2/tasks', taskRoutes);
app.route('/api/v2/audit', auditRoutes);
app.route('/api/v2/sla', slaRoutes);
app.route('/api/v2/workflows', workflowRoutes);
app.route('/api/v2/costs', costRoutes);
app.route('/api/v2/decisions', decisionRoutes);
app.route('/api/v2/intelligence', intelligenceRoutes);
app.route('/api/v2/events', eventsRoutes);
app.route('/api/v2/notifications', notificationRoutes);
app.route('/api/v2/webhooks', webhookRoutes);
app.route('/api/v2/deploy', deployRoutes);
app.route('/api/v2/chat', chatRoutes);
app.route('/api/v2/search', searchRoutes);

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'orkwork API',
    version: '2.0.0',
    message: 'Welcome to orkwork API v2',
    documentation: '/api',
    health: '/api/health',
  });
});

// Start server
const startServer = () => {
  console.log(`🚀 Starting orkwork API v2...`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: ${config.PORT}`);
  console.log(`🔗 CORS Origin: ${config.CORS_ORIGIN}`);
  
  // Initialize and start background scheduler
  console.log(`⏰ Initializing background scheduler...`);
  initializeScheduler();
  scheduler.start();
  
  const server = Bun.serve({
    hostname: "127.0.0.1",
    port: config.PORT,
    fetch: app.fetch,
    error(error) {
      console.error('Server error:', error);
      return new Response('Internal Server Error', { status: 500 });
    },
  });

  console.log(`✅ Server running at http://localhost:${config.PORT}`);
  console.log(`📋 Health check: http://localhost:${config.PORT}/api/health`);
  console.log(`📖 API docs: http://localhost:${config.PORT}/api`);
  console.log(`🔄 Background scheduler started`);
  
  return server;
};

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  
  // Stop background scheduler
  console.log('⏰ Stopping background scheduler...');
  scheduler.stop();
  
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start the server
startServer();

// Named export for testing (avoid default export — Bun auto-serves default exports)
export { app, startServer };