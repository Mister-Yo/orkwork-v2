import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { createHash } from 'crypto';
import { eq, and, gt, sql } from 'drizzle-orm';
import { db, users, sessions, agents, apiKeys, type User, type Agent, type ApiKey } from '../db';

export type UserRole = 'owner' | 'admin' | 'member' | 'pending' | 'viewer';

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
  pending: -1,
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

// Middleware to extract and validate session or API key
export const authMiddleware = createMiddleware(async (c, next) => {
  // Try to get token from cookie first, then Authorization header
  let token = getCookie(c, 'session_token');
  let isApiKey = false;
  
  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      
      // Check if this is an API key (starts with 'ork_')
      if (token.startsWith('ork_')) {
        isApiKey = true;
      }
    }
  }

  if (token) {
    try {
      if (isApiKey) {
        // Handle API key authentication
        const keyHash = createHash('sha256').update(token).digest('hex');
        
        // Find active API key with agent data
        const result = await db
          .select({
            apiKey: apiKeys,
            agent: agents,
          })
          .from(apiKeys)
          .innerJoin(agents, eq(apiKeys.agentId, agents.id))
          .where(
            and(
              eq(apiKeys.keyHash, keyHash),
              eq(apiKeys.isActive, true),
              // Check expiration: allow if null (no expiry) or not yet expired
              sql`(${apiKeys.expiresAt} IS NULL OR ${apiKeys.expiresAt} > NOW())`
            )
          )
          .limit(1);

        if (result.length > 0) {
          const { apiKey, agent } = result[0];
          
          // Store agent context
          c.set('authType', 'agent' as const);
          c.set('agent', agent);
          c.set('apiKey', apiKey);
          c.set('agentScopes', apiKey.scopes);
          
          // Update last used timestamp
          await db.update(apiKeys)
            .set({ lastUsedAt: new Date() })
            .where(eq(apiKeys.id, apiKey.id));
        }
      } else {
        // Handle session authentication
        const hash = createHash('sha256').update(token).digest('hex');
        
        // Find active session with user data
        const result = await db
          .select({
            session: sessions,
            user: users,
          })
          .from(sessions)
          .innerJoin(users, eq(sessions.userId, users.id))
          .where(
            and(
              eq(sessions.tokenHash, hash),
              gt(sessions.expiresAt, new Date())
            )
          )
          .limit(1);

        if (result.length > 0) {
          const { user, session } = result[0];
          
          // Store user context
          c.set('authType', 'user' as const);
          c.set('user', user);
          c.set('session', session);
          
          // Update user activity (could be rate limited in production)
          // await db.update(sessions)
          //   .set({ updatedAt: new Date() })
          //   .where(eq(sessions.id, session.id));
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Continue without user - let protected routes handle the rejection
    }
  }

  await next();
});

// Middleware to require authentication (user or agent)
export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get('user') as User | undefined;
  const agent = c.get('agent') as Agent | undefined;
  const authType = c.get('authType') as 'user' | 'agent' | undefined;
  
  if (!authType || (!user && !agent)) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  // Block pending users from all routes except /api/auth/me and /api/auth/logout
  if (authType === 'user' && user && user.role === 'pending') {
    const path = c.req.path;
    if (!path.endsWith('/auth/me') && !path.endsWith('/auth/logout')) {
      return c.json({ error: 'Account pending approval' }, 403);
    }
  }

  await next();
});

// Middleware to require specific role or higher (user auth only)
export const requireRole = (minRole: UserRole) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user') as User | undefined;
    const authType = c.get('authType') as 'user' | 'agent' | undefined;
    
    // Only allow user authentication for role-based restrictions
    if (authType !== 'user' || !user) {
      return c.json({ 
        error: 'User authentication required',
        message: 'This endpoint requires user authentication with appropriate role'
      }, 401);
    }

    const userRoleLevel = roleHierarchy[user.role];
    const requiredRoleLevel = roleHierarchy[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      return c.json({ 
        error: 'Insufficient permissions',
        required: minRole,
        current: user.role 
      }, 403);
    }

    await next();
  });
};

// Helper function to check if user has specific role or higher
export function hasRole(user: User, minRole: UserRole): boolean {
  const userRoleLevel = roleHierarchy[user.role];
  const requiredRoleLevel = roleHierarchy[minRole];
  return userRoleLevel >= requiredRoleLevel;
}

// Helper function to get user from context (throws if not user authenticated)
export function getAuthUser(c: any): User {
  const user = c.get('user') as User | undefined;
  const authType = c.get('authType') as 'user' | 'agent' | undefined;
  
  if (authType !== 'user' || !user) {
    throw new Error('User authentication required');
  }
  return user;
}

// Helper function to get user from context (returns null if not authenticated)
export function getOptionalUser(c: any): User | null {
  return c.get('user') as User | null;
}

// Helper function to get agent from context (throws if not agent authenticated)
export function getAuthAgent(c: any): Agent {
  const agent = c.get('agent') as Agent | undefined;
  const authType = c.get('authType') as 'user' | 'agent' | undefined;
  
  if (authType !== 'agent' || !agent) {
    throw new Error('Agent authentication required');
  }
  return agent;
}

// Helper function to get authentication context
export function getAuthContext(c: any): { type: 'user' | 'agent'; user?: User; agent?: Agent } {
  const authType = c.get('authType') as 'user' | 'agent' | undefined;
  const user = c.get('user') as User | undefined;
  const agent = c.get('agent') as Agent | undefined;
  
  if (!authType) {
    throw new Error('Authentication required');
  }
  
  return { type: authType, user, agent };
}