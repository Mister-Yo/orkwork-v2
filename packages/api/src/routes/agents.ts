import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, agents, type Agent, type NewAgent } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';

const app = new Hono();

// Validation schemas
const createAgentSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['assistant', 'specialist', 'researcher', 'manager']),
  model: z.string().min(1).max(100),
  systemPrompt: z.string().min(1),
  capabilities: z.array(z.string()).optional().default([]),
  config: z.record(z.any()).optional().default({}),
});

const updateAgentSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(['assistant', 'specialist', 'researcher', 'manager']).optional(),
  model: z.string().min(1).max(100).optional(),
  systemPrompt: z.string().min(1).optional(),
  capabilities: z.array(z.string()).optional(),
  status: z.enum(['active', 'idle', 'error', 'disabled']).optional(),
  config: z.record(z.any()).optional(),
});

// GET /api/v2/agents - List all agents
app.get('/', requireAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const status = c.req.query('status');
    const type = c.req.query('type');

    // Build query conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(agents.status, status as any));
    }
    if (type) {
      conditions.push(eq(agents.type, type as any));
    }

    // Get agents with pagination
    const [agentsList, totalResult] = await Promise.all([
      db
        .select()
        .from(agents)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .orderBy(agents.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(agents)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      agents: agentsList,
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
    console.error('Error fetching agents:', error);
    return c.json({ error: 'Failed to fetch agents' }, 500);
  }
});

// POST /api/v2/agents - Create new agent (admin+)
app.post('/', requireRole('admin'), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createAgentSchema.parse(body);

    const newAgent: NewAgent = {
      ...validatedData,
      status: 'idle',
    };

    const [createdAgent] = await db.insert(agents).values(newAgent).returning();

    return c.json({ agent: createdAgent }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating agent:', error);
    return c.json({ error: 'Failed to create agent' }, 500);
  }
});

// GET /api/v2/agents/:id - Get specific agent
app.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (agent.length === 0) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    return c.json({ agent: agent[0] });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return c.json({ error: 'Failed to fetch agent' }, 500);
  }
});

// PATCH /api/v2/agents/:id - Update agent
app.patch('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const validatedData = updateAgentSchema.parse(body);

    // Check if agent exists
    const existingAgent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (existingAgent.length === 0) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Update agent
    const [updatedAgent] = await db
      .update(agents)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, id))
      .returning();

    return c.json({ agent: updatedAgent });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating agent:', error);
    return c.json({ error: 'Failed to update agent' }, 500);
  }
});

// DELETE /api/v2/agents/:id - Delete agent (owner only)
app.delete('/:id', requireRole('owner'), async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Check if agent exists
    const existingAgent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (existingAgent.length === 0) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Delete agent (cascade will handle related records)
    await db.delete(agents).where(eq(agents.id, id));

    return c.json({ message: 'Agent deleted successfully' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return c.json({ error: 'Failed to delete agent' }, 500);
  }
});

export default app;