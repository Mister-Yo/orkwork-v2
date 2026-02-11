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

// Import middleware
import { auditMiddleware } from './middleware/audit';

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
        scopes: '/api/v2/agents/scopes',
        users: '/api/v2/users',
        projects: '/api/v2/projects',
        tasks: '/api/v2/tasks',
        executions: '/api/v2/tasks/:taskId/executions',
        audit: '/api/v2/audit',
        sla: '/api/v2/sla',
        workflows: '/api/v2/workflows',
      },
    },
  });
});

// Authentication routes
app.route('/api/auth', authRoutes);

// API v2 routes
app.route('/api/v2/agents', agentRoutes);
app.route('/api/v2/agents', apiKeyRoutes); // Mount API key routes under agents path
app.route('/api/v2/users', userRoutes);
app.route('/api/v2/projects', projectRoutes);
app.route('/api/v2/tasks', taskRoutes);
app.route('/api/v2/audit', auditRoutes);
app.route('/api/v2/sla', slaRoutes);
app.route('/api/v2/workflows', workflowRoutes);

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
  
  const server = Bun.serve({
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
  
  return server;
};

// Graceful shutdown
const shutdown = (signal: string) => {
  console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start the server
startServer();

// Named export for testing (avoid default export — Bun auto-serves default exports)
export { app, startServer };