import { createMiddleware } from 'hono/factory';
import { db, auditLog, type NewAuditLog } from '../db';
import { getOptionalUser } from '../auth/middleware';

// Mapping of HTTP methods to actions
const methodToAction: Record<string, string> = {
  POST: 'create',
  PATCH: 'update',
  PUT: 'update',
  DELETE: 'delete',
};

// Extract resource type and ID from path
function parseResourceFromPath(path: string): { resourceType?: string; resourceId?: string } {
  // Match patterns like /api/v2/projects/123, /api/v2/tasks/456/dependencies
  const match = path.match(/\/api\/v2\/(\w+)(?:\/([^\/]+))?/);
  
  if (!match) {
    return {};
  }

  const resourceType = match[1]; // projects, tasks, agents, etc.
  const resourceId = match[2]; // UUID or other identifier
  
  // Basic UUID validation (36 chars with dashes)
  const isUuid = resourceId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resourceId);
  
  return {
    resourceType,
    resourceId: isUuid ? resourceId : undefined,
  };
}

// Extract details from request body (sanitized)
function extractDetails(body: any, method: string): Record<string, any> {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const details: Record<string, any> = {
    method,
  };

  // For create/update operations, capture key fields but not sensitive data
  if (method === 'POST' || method === 'PATCH' || method === 'PUT') {
    const allowedFields = [
      'name', 'title', 'description', 'status', 'priority', 'type',
      'role', 'autonomyLevel', 'budget', 'deadline', 'dueDate',
      'acceptanceCriteria', 'reviewRequired', 'autoAssigned',
    ];

    for (const field of allowedFields) {
      if (field in body) {
        details[field] = body[field];
      }
    }

    // Truncate long text fields
    ['description', 'acceptanceCriteria'].forEach(field => {
      if (details[field] && typeof details[field] === 'string' && details[field].length > 200) {
        details[field] = details[field].substring(0, 200) + '...';
      }
    });
  }

  return details;
}

// Audit middleware that logs POST/PATCH/DELETE requests
export const auditMiddleware = createMiddleware(async (c, next) => {
  const method = c.req.method;
  
  // Only audit write operations
  if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    await next();
    return;
  }

  // Skip audit routes themselves
  if (c.req.path.includes('/audit')) {
    await next();
    return;
  }

  // Skip health checks and non-API routes
  if (!c.req.path.startsWith('/api/v2/')) {
    await next();
    return;
  }

  const user = getOptionalUser(c);
  const { resourceType, resourceId } = parseResourceFromPath(c.req.path);
  
  // Only audit if we can identify the resource type
  if (!resourceType) {
    await next();
    return;
  }

  let requestBody: any = null;
  
  // Capture request body for logging (clone the request first)
  if (['POST', 'PATCH', 'PUT'].includes(method)) {
    try {
      // Clone request to avoid consuming the body
      const clonedReq = c.req.clone();
      requestBody = await clonedReq.json();
    } catch (error) {
      // Body might not be JSON, that's fine
      requestBody = null;
    }
  }

  // Execute the actual request
  await next();

  // Log the audit entry asynchronously (don't block the response)
  const logEntry = async () => {
    try {
      const action = methodToAction[method] || method.toLowerCase();
      const details = extractDetails(requestBody, method);

      // Add response status and timing info
      details.path = c.req.path;
      details.userAgent = c.req.header('User-Agent')?.substring(0, 200);

      const auditEntry: NewAuditLog = {
        actorId: user?.id || '00000000-0000-0000-0000-000000000000', // system user for unauthenticated
        actorType: user ? 'user' : 'system',
        action,
        resourceType,
        resourceId: resourceId || '00000000-0000-0000-0000-000000000000', // placeholder for list operations
        details,
        ip: c.req.header('X-Forwarded-For') || c.req.header('X-Real-IP') || 'unknown',
      };

      await db.insert(auditLog).values(auditEntry);
    } catch (error) {
      // Log audit failures but don't break the request
      console.error('Failed to log audit entry:', error);
    }
  };

  // Run audit logging in background
  logEntry();
});

// Helper function to manually log audit entries
export async function logAuditEntry(params: {
  actorId: string;
  actorType: 'user' | 'agent' | 'system';
  action: string;
  resourceType: string;
  resourceId: string;
  details?: Record<string, any>;
  ip?: string;
}) {
  try {
    const auditEntry: NewAuditLog = {
      actorId: params.actorId,
      actorType: params.actorType,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details || {},
      ip: params.ip || 'system',
    };

    await db.insert(auditLog).values(auditEntry);
  } catch (error) {
    console.error('Failed to log audit entry:', error);
  }
}