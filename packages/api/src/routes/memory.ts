import { Hono } from 'hono';
import { eq, sql, and, like } from 'drizzle-orm';
import { z } from 'zod';
import { db, agentMemory, agents, type AgentMemory, type NewAgentMemory } from '../db';
import { requireAuth, getAuthAgent, getAuthContext } from '../auth/middleware';
import { requireScope } from '../auth/scopes';

const app = new Hono();

// Validation schemas
const createMemorySchema = z.object({
  memory_type: z.enum(['fact', 'preference', 'lesson', 'context']),
  content: z.string().min(1),
  relevance_score: z.number().int().min(0).max(100).optional(),
  expires_at: z.string().datetime().optional(),
});

const updateMemorySchema = z.object({
  content: z.string().min(1).optional(),
  relevance_score: z.number().int().min(0).max(100).optional(),
  expires_at: z.string().datetime().optional(),
});

// POST /api/v2/agents/:agentId/memory - Add memory entry
app.post('/:agentId/memory', requireAuth, requireScope('memory:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const body = await c.req.json();
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const validatedData = createMemorySchema.parse(body);

    // Check authorization - agent can add own memories or admin+ can add for any agent
    const authContext = getAuthContext(c);
    if (authContext.type === 'agent') {
      const authAgent = getAuthAgent(c);
      if (authAgent.id !== agentId) {
        return c.json({ 
          error: 'Insufficient permissions',
          message: 'Agent can only add memories for itself'
        }, 403);
      }
    }

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    const newMemory: NewAgentMemory = {
      agentId,
      memoryType: validatedData.memory_type,
      content: validatedData.content,
      embedding: null, // For now, store as null (we'll add OpenAI embedding later)
      relevanceScore: validatedData.relevance_score || null,
      expiresAt: validatedData.expires_at ? new Date(validatedData.expires_at) : null,
    };

    const [createdMemory] = await db.insert(agentMemory).values(newMemory).returning();

    return c.json({ memory: createdMemory }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating memory:', error);
    return c.json({ error: 'Failed to create memory' }, 500);
  }
});

// GET /api/v2/agents/:agentId/memory - List memories
app.get('/:agentId/memory', requireAuth, requireScope('memory:read'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Parse query parameters
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;
    
    const memoryType = c.req.query('memory_type');
    const search = c.req.query('search');

    // Build query conditions
    const conditions = [eq(agentMemory.agentId, agentId)];
    
    if (memoryType) {
      conditions.push(eq(agentMemory.memoryType, memoryType as any));
    }
    
    if (search) {
      conditions.push(like(agentMemory.content, `%${search}%`));
    }

    // Get memories with pagination
    const [memories, totalResult] = await Promise.all([
      db
        .select()
        .from(agentMemory)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(sql`${agentMemory.relevanceScore} DESC NULLS LAST, ${agentMemory.createdAt} DESC`)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(agentMemory)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      memories,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching memories:', error);
    return c.json({ error: 'Failed to fetch memories' }, 500);
  }
});

// GET /api/v2/agents/:agentId/memory/:memoryId - Get single memory
app.get('/:agentId/memory/:memoryId', requireAuth, requireScope('memory:read'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const memoryId = c.req.param('memoryId');
    
    if (!agentId || !memoryId) {
      return c.json({ error: 'Agent ID and Memory ID are required' }, 400);
    }

    const [memory] = await db
      .select()
      .from(agentMemory)
      .where(and(eq(agentMemory.agentId, agentId), eq(agentMemory.id, memoryId)))
      .limit(1);

    if (!memory) {
      return c.json({ error: 'Memory not found' }, 404);
    }

    return c.json({ memory });
  } catch (error) {
    console.error('Error fetching memory:', error);
    return c.json({ error: 'Failed to fetch memory' }, 500);
  }
});

// PATCH /api/v2/agents/:agentId/memory/:memoryId - Update memory
app.patch('/:agentId/memory/:memoryId', requireAuth, requireScope('memory:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const memoryId = c.req.param('memoryId');
    const body = await c.req.json();
    
    if (!agentId || !memoryId) {
      return c.json({ error: 'Agent ID and Memory ID are required' }, 400);
    }

    const validatedData = updateMemorySchema.parse(body);

    // Check authorization - agent can update own memories
    const authContext = getAuthContext(c);
    if (authContext.type === 'agent') {
      const authAgent = getAuthAgent(c);
      if (authAgent.id !== agentId) {
        return c.json({ 
          error: 'Insufficient permissions',
          message: 'Agent can only update its own memories'
        }, 403);
      }
    }

    // Check if memory exists
    const [existingMemory] = await db
      .select()
      .from(agentMemory)
      .where(and(eq(agentMemory.agentId, agentId), eq(agentMemory.id, memoryId)))
      .limit(1);

    if (!existingMemory) {
      return c.json({ error: 'Memory not found' }, 404);
    }

    // Update memory
    const updateData: Partial<AgentMemory> = {};
    
    if (validatedData.content !== undefined) {
      updateData.content = validatedData.content;
    }
    if (validatedData.relevance_score !== undefined) {
      updateData.relevanceScore = validatedData.relevance_score;
    }
    if (validatedData.expires_at !== undefined) {
      updateData.expiresAt = new Date(validatedData.expires_at);
    }

    const [updatedMemory] = await db
      .update(agentMemory)
      .set(updateData)
      .where(eq(agentMemory.id, memoryId))
      .returning();

    return c.json({ memory: updatedMemory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating memory:', error);
    return c.json({ error: 'Failed to update memory' }, 500);
  }
});

// DELETE /api/v2/agents/:agentId/memory/:memoryId - Delete memory
app.delete('/:agentId/memory/:memoryId', requireAuth, requireScope('memory:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const memoryId = c.req.param('memoryId');
    
    if (!agentId || !memoryId) {
      return c.json({ error: 'Agent ID and Memory ID are required' }, 400);
    }

    // Check authorization - agent can delete own memories
    const authContext = getAuthContext(c);
    if (authContext.type === 'agent') {
      const authAgent = getAuthAgent(c);
      if (authAgent.id !== agentId) {
        return c.json({ 
          error: 'Insufficient permissions',
          message: 'Agent can only delete its own memories'
        }, 403);
      }
    }

    // Check if memory exists
    const [existingMemory] = await db
      .select()
      .from(agentMemory)
      .where(and(eq(agentMemory.agentId, agentId), eq(agentMemory.id, memoryId)))
      .limit(1);

    if (!existingMemory) {
      return c.json({ error: 'Memory not found' }, 404);
    }

    // Delete memory
    await db.delete(agentMemory).where(eq(agentMemory.id, memoryId));

    return c.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return c.json({ error: 'Failed to delete memory' }, 500);
  }
});

// POST /api/v2/agents/:agentId/memory/consolidate - Merge similar memories
app.post('/:agentId/memory/consolidate', requireAuth, requireScope('memory:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Check authorization - agent can consolidate own memories
    const authContext = getAuthContext(c);
    if (authContext.type === 'agent') {
      const authAgent = getAuthAgent(c);
      if (authAgent.id !== agentId) {
        return c.json({ 
          error: 'Insufficient permissions',
          message: 'Agent can only consolidate its own memories'
        }, 403);
      }
    }

    // Simple consolidation: find memories with same type and similar content
    // This is a basic implementation - in production you'd use proper similarity algorithms
    const memoriesByType = await db
      .select()
      .from(agentMemory)
      .where(eq(agentMemory.agentId, agentId))
      .orderBy(agentMemory.memoryType, agentMemory.createdAt);

    let consolidatedCount = 0;
    const typeGroups = new Map<string, AgentMemory[]>();
    
    // Group by memory type
    for (const memory of memoriesByType) {
      const key = memory.memoryType;
      if (!typeGroups.has(key)) {
        typeGroups.set(key, []);
      }
      typeGroups.get(key)!.push(memory);
    }

    // Simple deduplication within each type
    for (const [type, memories] of typeGroups) {
      const seen = new Set<string>();
      const duplicates: string[] = [];

      for (const memory of memories) {
        // Simple content similarity check (case-insensitive, whitespace normalized)
        const normalizedContent = memory.content.toLowerCase().replace(/\s+/g, ' ').trim();
        
        if (seen.has(normalizedContent)) {
          duplicates.push(memory.id);
        } else {
          seen.add(normalizedContent);
        }
      }

      // Delete duplicates
      if (duplicates.length > 0) {
        await db.delete(agentMemory).where(sql`${agentMemory.id} = ANY(${duplicates})`);
        consolidatedCount += duplicates.length;
      }
    }

    return c.json({ 
      message: `Consolidated ${consolidatedCount} duplicate memories`,
      consolidated_count: consolidatedCount 
    });
  } catch (error) {
    console.error('Error consolidating memories:', error);
    return c.json({ error: 'Failed to consolidate memories' }, 500);
  }
});

// DELETE /api/v2/agents/:agentId/memory/expired - Clean up expired memories
app.delete('/:agentId/memory/expired', requireAuth, requireScope('memory:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Check authorization - agent can clean up own memories
    const authContext = getAuthContext(c);
    if (authContext.type === 'agent') {
      const authAgent = getAuthAgent(c);
      if (authAgent.id !== agentId) {
        return c.json({ 
          error: 'Insufficient permissions',
          message: 'Agent can only clean up its own memories'
        }, 403);
      }
    }

    // Count expired memories first
    const [expiredCount] = await db
      .select({ count: sql`count(*)`.as('count') })
      .from(agentMemory)
      .where(
        and(
          eq(agentMemory.agentId, agentId),
          sql`${agentMemory.expiresAt} IS NOT NULL AND ${agentMemory.expiresAt} < NOW()`
        )
      );

    const count = Number(expiredCount.count);

    // Delete expired memories
    await db
      .delete(agentMemory)
      .where(
        and(
          eq(agentMemory.agentId, agentId),
          sql`${agentMemory.expiresAt} IS NOT NULL AND ${agentMemory.expiresAt} < NOW()`
        )
      );

    return c.json({ 
      message: `Cleaned up ${count} expired memories`,
      deleted_count: count 
    });
  } catch (error) {
    console.error('Error cleaning up expired memories:', error);
    return c.json({ error: 'Failed to clean up expired memories' }, 500);
  }
});

export default app;