import { createMiddleware } from 'hono/factory';
import { getCookie } from 'hono/cookie';
import { createHash } from 'crypto';
import { eq, and, gt } from 'drizzle-orm';
import { db, users, sessions, type User } from '../db';

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

// Middleware to extract and validate session
export const authMiddleware = createMiddleware(async (c, next) => {
  // Try to get token from cookie first, then Authorization header
  let token = getCookie(c, 'session_token');
  
  if (!token) {
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    try {
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
        
        // Store user in context
        c.set('user', user);
        c.set('session', session);
        
        // Update user activity (could be rate limited in production)
        // await db.update(sessions)
        //   .set({ updatedAt: new Date() })
        //   .where(eq(sessions.id, session.id));
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      // Continue without user - let protected routes handle the rejection
    }
  }

  await next();
});

// Middleware to require authentication
export const requireAuth = createMiddleware(async (c, next) => {
  const user = c.get('user') as User | undefined;
  
  if (!user) {
    return c.json({ error: 'Authentication required' }, 401);
  }

  await next();
});

// Middleware to require specific role or higher
export const requireRole = (minRole: UserRole) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user') as User | undefined;
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
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

// Helper function to get user from context (throws if not authenticated)
export function getAuthUser(c: any): User {
  const user = c.get('user') as User | undefined;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}

// Helper function to get user from context (returns null if not authenticated)
export function getOptionalUser(c: any): User | null {
  return c.get('user') as User | null;
}