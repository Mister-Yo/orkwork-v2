import { Hono } from 'hono';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { randomBytes, createHash } from 'crypto';
import { db, agents, apiKeys, type Agent, type ApiKey, type NewApiKey } from '../db';
import { requireRole, getAuthUser } from '../auth/middleware';
import { validateScopes, AVAILABLE_SCOPES } from '../auth/scopes';

const app = new Hono();

// Validation schemas
const createApiKeySchema = z.object({
  name: z.string().min(1).max(255),
  scopes: z.array(z.string()).min(1).refine(
    (scopes) => validateScopes(scopes),
    { message: 'Invalid scopes provided' }
  ),
  expiresAt: z.string().datetime().optional(),
});

const updateApiKeySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  scopes: z.array(z.string()).optional().refine(
    (scopes) => !scopes || validateScopes(scopes),
    { message: 'Invalid scopes provided' }
  ),
  isActive: z.boolean().optional(),
});

// Helper function to generate API key
function generateApiKey(): { key: string; hash: string; prefix: string } {
  const randomPart = randomBytes(20).toString('hex'); // 40 hex chars
  const key = `ork_${randomPart}`;
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 8); // First 8 chars for identification
  return { key, hash, prefix };
}

// Helper function to check if agent exists and user has access
async function validateAgentAccess(agentId: string, userId: string): Promise<Agent | null> {
  const agent = await db
    .select()
    .from(agents)
    .where(eq(agents.id, agentId))
    .limit(1);

  return agent.length > 0 ? agent[0] : null;
}

// GET /api/v2/agents/:agentId/keys - List keys for agent (admin+)
app.get('/:agentId/keys', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const user = getAuthUser(c);

    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Validate agent exists
    const agent = await validateAgentAccess(agentId, user.id);
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Get API keys for this agent
    const keys = await db
      .select({
        id: apiKeys.id,
        name: apiKeys.name,
        keyPrefix: apiKeys.keyPrefix,
        scopes: apiKeys.scopes,
        expiresAt: apiKeys.expiresAt,
        lastUsedAt: apiKeys.lastUsedAt,
        isActive: apiKeys.isActive,
        createdAt: apiKeys.createdAt,
      })
      .from(apiKeys)
      .where(eq(apiKeys.agentId, agentId))
      .orderBy(apiKeys.createdAt);

    return c.json({ keys });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return c.json({ error: 'Failed to fetch API keys' }, 500);
  }
});

// POST /api/v2/agents/:agentId/keys - Create key (admin+)
app.post('/:agentId/keys', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const user = getAuthUser(c);
    const body = await c.req.json();

    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const validatedData = createApiKeySchema.parse(body);

    // Validate agent exists
    const agent = await validateAgentAccess(agentId, user.id);
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Generate API key
    const { key, hash, prefix } = generateApiKey();

    // Create API key record
    const newApiKey: NewApiKey = {
      agentId,
      name: validatedData.name,
      keyHash: hash,
      keyPrefix: prefix,
      scopes: validatedData.scopes,
      expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      createdBy: user.id,
    };

    const [createdKey] = await db.insert(apiKeys).values(newApiKey).returning();

    // Return the full key ONLY on creation
    return c.json({
      key: key, // Full key returned only once
      apiKey: {
        id: createdKey.id,
        name: createdKey.name,
        keyPrefix: createdKey.keyPrefix,
        scopes: createdKey.scopes,
        expiresAt: createdKey.expiresAt,
        isActive: createdKey.isActive,
        createdAt: createdKey.createdAt,
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error creating API key:', error);
    return c.json({ error: 'Failed to create API key' }, 500);
  }
});

// PATCH /api/v2/agents/:agentId/keys/:keyId - Update key (admin+)
app.patch('/:agentId/keys/:keyId', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const keyId = c.req.param('keyId');
    const user = getAuthUser(c);
    const body = await c.req.json();

    if (!agentId || !keyId) {
      return c.json({ error: 'Agent ID and Key ID are required' }, 400);
    }

    const validatedData = updateApiKeySchema.parse(body);

    // Validate agent exists
    const agent = await validateAgentAccess(agentId, user.id);
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Check if key exists and belongs to this agent
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.agentId, agentId)
      ))
      .limit(1);

    if (existingKey.length === 0) {
      return c.json({ error: 'API key not found' }, 404);
    }

    // Update key
    const [updatedKey] = await db
      .update(apiKeys)
      .set(validatedData)
      .where(eq(apiKeys.id, keyId))
      .returning();

    return c.json({
      apiKey: {
        id: updatedKey.id,
        name: updatedKey.name,
        keyPrefix: updatedKey.keyPrefix,
        scopes: updatedKey.scopes,
        expiresAt: updatedKey.expiresAt,
        isActive: updatedKey.isActive,
        createdAt: updatedKey.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating API key:', error);
    return c.json({ error: 'Failed to update API key' }, 500);
  }
});

// DELETE /api/v2/agents/:agentId/keys/:keyId - Revoke key (admin+)
app.delete('/:agentId/keys/:keyId', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const keyId = c.req.param('keyId');
    const user = getAuthUser(c);

    if (!agentId || !keyId) {
      return c.json({ error: 'Agent ID and Key ID are required' }, 400);
    }

    // Validate agent exists
    const agent = await validateAgentAccess(agentId, user.id);
    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Check if key exists and belongs to this agent
    const existingKey = await db
      .select()
      .from(apiKeys)
      .where(and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.agentId, agentId)
      ))
      .limit(1);

    if (existingKey.length === 0) {
      return c.json({ error: 'API key not found' }, 404);
    }

    // Revoke key (set is_active to false)
    await db
      .update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, keyId));

    return c.json({ message: 'API key revoked successfully' });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return c.json({ error: 'Failed to revoke API key' }, 500);
  }
});

// GET /api/v2/scopes - List available scopes
app.get('/scopes', requireRole('admin'), async (c) => {
  try {
    return c.json({
      scopes: AVAILABLE_SCOPES,
    });
  } catch (error) {
    console.error('Error fetching scopes:', error);
    return c.json({ error: 'Failed to fetch scopes' }, 500);
  }
});

export default app;