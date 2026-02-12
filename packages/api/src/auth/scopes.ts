import { createMiddleware } from 'hono/factory';
import type { User } from '../db';
import { hasRole } from './middleware';

// Available scopes for API keys
export const AVAILABLE_SCOPES = [
  'tasks:read',
  'tasks:write',
  'tasks:assign',
  'agents:read',
  'agents:write',
  'projects:read',
  'projects:write',
  'memory:read',
  'memory:write',
  'costs:read',
  'costs:write',
  'decisions:read',
  'decisions:write',
  'chat:read',
  'chat:write',
  'workflows:read',
  'workflows:write',
  'sla:read',
  'sla:write',
  'executions:read',
  'executions:write',
] as const;

export type Scope = typeof AVAILABLE_SCOPES[number];

// Check if user/agent has a specific scope
export function hasScope(userScopes: string[], required: string): boolean {
  return userScopes.includes('*') || userScopes.includes(required);
}

// Get scopes for user based on role (for session-based auth)
export function getUserScopes(user: User): string[] {
  // User auth grants scopes based on role hierarchy
  if (hasRole(user, 'owner') || hasRole(user, 'admin')) {
    return [...AVAILABLE_SCOPES]; // All scopes
  } else if (hasRole(user, 'member')) {
    return AVAILABLE_SCOPES.filter(scope => 
      scope.endsWith(':read') || scope.endsWith(':write')
    ); // Read + write scopes
  } else {
    return AVAILABLE_SCOPES.filter(scope => scope.endsWith(':read')); // Read-only
  }
}

// Middleware to require a specific scope
export const requireScope = (scope: string) => {
  return createMiddleware(async (c, next) => {
    const user = c.get('user') as User | undefined;
    const authType = c.get('authType') as 'user' | 'agent' | undefined;
    const agentScopes = c.get('agentScopes') as string[] | undefined;

    if (!user && !agentScopes) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    let userScopes: string[] = [];

    if (authType === 'agent' && agentScopes) {
      // API key authentication
      userScopes = agentScopes;
    } else if (authType === 'user' && user) {
      // Session authentication
      userScopes = getUserScopes(user);
    } else {
      return c.json({ error: 'Invalid authentication type' }, 403);
    }

    if (!hasScope(userScopes, scope)) {
      return c.json({
        error: 'Insufficient permissions',
        required: scope,
        available: userScopes,
      }, 403);
    }

    await next();
  });
};

// Validate that scopes array contains only valid scopes
export function validateScopes(scopes: string[]): boolean {
  return scopes.every(scope => scope === "*" || AVAILABLE_SCOPES.includes(scope as Scope));
}