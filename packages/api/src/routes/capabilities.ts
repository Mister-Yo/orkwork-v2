import { Hono } from 'hono';
import { eq, sql, and, desc } from 'drizzle-orm';
import { z } from 'zod';
import { db, agentCapabilities, agents, type AgentCapability, type NewAgentCapability } from '../db';
import { requireAuth, requireRole } from '../auth/middleware';
import { requireScope } from '../auth/scopes';

const app = new Hono();

// Validation schemas
const createCapabilitySchema = z.object({
  capability: z.string().min(1).max(100),
  proficiency: z.number().int().min(0).max(100).optional().default(50),
});

const updateCapabilitySchema = z.object({
  proficiency: z.number().int().min(0).max(100),
});

// GET /api/v2/capabilities - List all unique capabilities across all agents
app.get('/', requireAuth, requireScope('agents:read'), async (c) => {
  try {
    const capabilities = await db
      .select({
        capability: agentCapabilities.capability,
        agent_count: sql`COUNT(DISTINCT ${agentCapabilities.agentId})`.as('agent_count'),
        avg_proficiency: sql`AVG(${agentCapabilities.proficiency})`.as('avg_proficiency'),
      })
      .from(agentCapabilities)
      .where(eq(agentCapabilities.enabled, true))
      .groupBy(agentCapabilities.capability)
      .orderBy(sql`COUNT(DISTINCT ${agentCapabilities.agentId}) DESC`);

    const formattedCapabilities = capabilities.map(cap => ({
      capability: cap.capability,
      agent_count: Number(cap.agent_count),
      avg_proficiency: Math.round(Number(cap.avg_proficiency) * 100) / 100,
    }));

    return c.json({ capabilities: formattedCapabilities });
  } catch (error) {
    console.error('Error fetching capabilities:', error);
    return c.json({ error: 'Failed to fetch capabilities' }, 500);
  }
});

// GET /api/v2/capabilities/:capability/agents - Get agents with this capability
app.get('/:capability/agents', requireAuth, requireScope('agents:read'), async (c) => {
  try {
    const capability = c.req.param('capability');
    
    if (!capability) {
      return c.json({ error: 'Capability name is required' }, 400);
    }

    const minProficiency = parseInt(c.req.query('min_proficiency') || '0', 10);

    const agentsWithCapability = await db
      .select({
        agent_id: agents.id,
        agent_name: agents.name,
        agent_type: agents.type,
        agent_status: agents.status,
        proficiency: agentCapabilities.proficiency,
        capability_id: agentCapabilities.id,
        enabled: agentCapabilities.enabled,
        created_at: agentCapabilities.createdAt,
      })
      .from(agentCapabilities)
      .innerJoin(agents, eq(agentCapabilities.agentId, agents.id))
      .where(
        and(
          eq(agentCapabilities.capability, capability),
          eq(agentCapabilities.enabled, true),
          sql`${agentCapabilities.proficiency} >= ${minProficiency}`
        )
      )
      .orderBy(desc(agentCapabilities.proficiency));

    return c.json({ 
      capability,
      min_proficiency: minProficiency,
      agents: agentsWithCapability 
    });
  } catch (error) {
    console.error('Error fetching agents with capability:', error);
    return c.json({ error: 'Failed to fetch agents with capability' }, 500);
  }
});

// POST /api/v2/agents/:agentId/capabilities - Add capability to agent
app.post('/:agentId/capabilities', requireAuth, requireScope('agents:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const body = await c.req.json();
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const validatedData = createCapabilitySchema.parse(body);

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Check if capability already exists for this agent
    const [existingCapability] = await db
      .select()
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.capability, validatedData.capability)
        )
      )
      .limit(1);

    if (existingCapability) {
      return c.json({ 
        error: 'Capability already exists',
        message: 'Agent already has this capability. Use PATCH to update proficiency.'
      }, 409);
    }

    const newCapability: NewAgentCapability = {
      agentId,
      capability: validatedData.capability,
      proficiency: validatedData.proficiency,
      enabled: true,
    };

    const [createdCapability] = await db
      .insert(agentCapabilities)
      .values(newCapability)
      .returning();

    return c.json({ capability: createdCapability }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating capability:', error);
    return c.json({ error: 'Failed to create capability' }, 500);
  }
});

// GET /api/v2/agents/:agentId/capabilities - List agent capabilities
app.get('/:agentId/capabilities', requireAuth, requireScope('agents:read'), async (c) => {
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

    const capabilities = await db
      .select()
      .from(agentCapabilities)
      .where(eq(agentCapabilities.agentId, agentId))
      .orderBy(desc(agentCapabilities.proficiency));

    return c.json({ capabilities });
  } catch (error) {
    console.error('Error fetching agent capabilities:', error);
    return c.json({ error: 'Failed to fetch agent capabilities' }, 500);
  }
});

// PATCH /api/v2/agents/:agentId/capabilities/:capId - Update capability proficiency
app.patch('/:agentId/capabilities/:capId', requireAuth, requireScope('agents:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const capId = c.req.param('capId');
    const body = await c.req.json();
    
    if (!agentId || !capId) {
      return c.json({ error: 'Agent ID and Capability ID are required' }, 400);
    }

    const validatedData = updateCapabilitySchema.parse(body);

    // Check if capability exists for this agent
    const [existingCapability] = await db
      .select()
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.id, capId)
        )
      )
      .limit(1);

    if (!existingCapability) {
      return c.json({ error: 'Capability not found for this agent' }, 404);
    }

    // Update capability
    const [updatedCapability] = await db
      .update(agentCapabilities)
      .set({ proficiency: validatedData.proficiency })
      .where(eq(agentCapabilities.id, capId))
      .returning();

    return c.json({ capability: updatedCapability });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating capability:', error);
    return c.json({ error: 'Failed to update capability' }, 500);
  }
});

// DELETE /api/v2/agents/:agentId/capabilities/:capId - Remove capability
app.delete('/:agentId/capabilities/:capId', requireAuth, requireScope('agents:write'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const capId = c.req.param('capId');
    
    if (!agentId || !capId) {
      return c.json({ error: 'Agent ID and Capability ID are required' }, 400);
    }

    // Check if capability exists for this agent
    const [existingCapability] = await db
      .select()
      .from(agentCapabilities)
      .where(
        and(
          eq(agentCapabilities.agentId, agentId),
          eq(agentCapabilities.id, capId)
        )
      )
      .limit(1);

    if (!existingCapability) {
      return c.json({ error: 'Capability not found for this agent' }, 404);
    }

    // Delete capability
    await db.delete(agentCapabilities).where(eq(agentCapabilities.id, capId));

    return c.json({ message: 'Capability removed successfully' });
  } catch (error) {
    console.error('Error deleting capability:', error);
    return c.json({ error: 'Failed to delete capability' }, 500);
  }
});

export default app;