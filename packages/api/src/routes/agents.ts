import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, agents, type Agent, type NewAgent } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';
import { requireScope } from '../auth/scopes';
import { calculateAgentScore } from '../engine/performance';
import { getAgentPermissions, changeAutonomyLevel, validateAutonomyChange } from '../engine/autonomy';
import { updateHeartbeat, getHealthReport } from '../engine/health';
import { emitAgentStatusChanged } from '../engine/events';

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

    // Emit agent status changed event if status was updated
    if (validatedData.status && existingAgent[0].status !== validatedData.status) {
      emitAgentStatusChanged(updatedAgent);
    }

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

// GET /api/v2/agents/:id/performance - Get agent performance score
app.get('/:id/performance', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, id))
      .limit(1);

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Calculate performance score
    const performanceData = await calculateAgentScore(id);

    return c.json({ data: performanceData });
  } catch (error) {
    console.error('Error fetching agent performance:', error);
    return c.json({ error: 'Failed to fetch agent performance' }, 500);
  }
});

// POST /api/v2/agents/:id/heartbeat - Agent reports alive
app.post('/:id/heartbeat', requireAuth, requireScope('agents:write'), async (c) => {
  try {
    const agentId = c.req.param('id');

    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    await updateHeartbeat(agentId);

    return c.json({ message: 'Heartbeat updated successfully' });
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return c.json({ error: 'Failed to update heartbeat' }, 500);
  }
});

// GET /api/v2/agents/:id/health - Get agent health report
app.get('/:id/health', requireAuth, async (c) => {
  try {
    const agentId = c.req.param('id');

    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const healthReport = await getHealthReport(agentId);

    return c.json({ health: healthReport });
  } catch (error) {
    console.error('Error fetching agent health:', error);
    return c.json({ error: 'Failed to fetch agent health' }, 500);
  }
});

// GET /api/v2/agents/:id/permissions - List agent permissions
app.get('/:id/permissions', requireAuth, async (c) => {
  try {
    const agentId = c.req.param('id');

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

    const permissions = await getAgentPermissions(agentId);

    return c.json({ 
      agent_id: agentId,
      autonomy_level: agent.autonomyLevel,
      permissions 
    });
  } catch (error) {
    console.error('Error fetching agent permissions:', error);
    return c.json({ error: 'Failed to fetch agent permissions' }, 500);
  }
});

// PATCH /api/v2/agents/:id/autonomy - Change autonomy level (owner only)
app.patch('/:id/autonomy', requireRole('owner'), async (c) => {
  try {
    const agentId = c.req.param('id');
    const body = await c.req.json();
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const schema = z.object({
      autonomy_level: z.enum(['tool', 'assistant', 'supervised', 'autonomous', 'strategic']),
      reason: z.string().min(1),
    });

    const { autonomy_level, reason } = schema.parse(body);
    const user = getAuthUser(c);

    // Get current agent to validate change
    const [currentAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!currentAgent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Validate the autonomy change
    const validation = validateAutonomyChange(currentAgent.autonomyLevel, autonomy_level);
    
    // Change autonomy level
    const updatedAgent = await changeAutonomyLevel(agentId, autonomy_level, reason, user.id);

    return c.json({ 
      agent: updatedAgent,
      validation_warnings: validation.warnings,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error changing autonomy level:', error);
    return c.json({ error: 'Failed to change autonomy level' }, 500);
  }
});

export default app;