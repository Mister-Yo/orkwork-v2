import { Hono } from 'hono';
import { eq, sql, and } from 'drizzle-orm';
import { z } from 'zod';
import { db, agentTools, agents, type AgentTool, type NewAgentTool } from '../db';
import { requireAuth, requireRole } from '../auth/middleware';
import { requireScope } from '../auth/scopes';

const app = new Hono();

// Available tool types
const TOOL_TYPES = ['git', 'shell', 'http', 'db_query', 'file_ops', 'browser', 'custom'] as const;

// Validation schemas
const createToolSchema = z.object({
  tool_name: z.string().min(1).max(100),
  tool_type: z.enum(TOOL_TYPES),
  description: z.string().optional(),
  config: z.record(z.any()).optional().default({}),
});

const updateToolSchema = z.object({
  tool_name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  config: z.record(z.any()).optional(),
  is_enabled: z.boolean().optional(),
});

// GET /api/v2/tools - List all available tool types
app.get('/', requireAuth, requireScope('agents:read'), async (c) => {
  try {
    const toolTypes = TOOL_TYPES.map(type => ({
      tool_type: type,
      description: getToolTypeDescription(type),
    }));

    return c.json({ tool_types: toolTypes });
  } catch (error) {
    console.error('Error fetching tool types:', error);
    return c.json({ error: 'Failed to fetch tool types' }, 500);
  }
});

// GET /api/v2/agents/:agentId/tools - List agent's tools
app.get('/:agentId/tools', requireAuth, requireScope('agents:read'), async (c) => {
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

    const tools = await db
      .select()
      .from(agentTools)
      .where(eq(agentTools.agentId, agentId))
      .orderBy(agentTools.toolName);

    return c.json({ tools });
  } catch (error) {
    console.error('Error fetching agent tools:', error);
    return c.json({ error: 'Failed to fetch agent tools' }, 500);
  }
});

// POST /api/v2/agents/:agentId/tools - Register tool for agent (admin+)
app.post('/:agentId/tools', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const body = await c.req.json();
    
    if (!agentId) {
      return c.json({ error: 'Agent ID is required' }, 400);
    }

    const validatedData = createToolSchema.parse(body);

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Check if tool already exists for this agent
    const [existingTool] = await db
      .select()
      .from(agentTools)
      .where(
        and(
          eq(agentTools.agentId, agentId),
          eq(agentTools.toolName, validatedData.tool_name)
        )
      )
      .limit(1);

    if (existingTool) {
      return c.json({ 
        error: 'Tool already exists',
        message: 'Agent already has a tool with this name'
      }, 409);
    }

    const newTool: NewAgentTool = {
      agentId,
      toolName: validatedData.tool_name,
      toolType: validatedData.tool_type,
      description: validatedData.description || null,
      config: validatedData.config,
      isEnabled: true,
    };

    const [createdTool] = await db
      .insert(agentTools)
      .values(newTool)
      .returning();

    return c.json({ tool: createdTool }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating tool:', error);
    return c.json({ error: 'Failed to create tool' }, 500);
  }
});

// GET /api/v2/agents/:agentId/tools/:toolId - Get specific tool
app.get('/:agentId/tools/:toolId', requireAuth, requireScope('agents:read'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const toolId = c.req.param('toolId');
    
    if (!agentId || !toolId) {
      return c.json({ error: 'Agent ID and Tool ID are required' }, 400);
    }

    const [tool] = await db
      .select()
      .from(agentTools)
      .where(and(eq(agentTools.agentId, agentId), eq(agentTools.id, toolId)))
      .limit(1);

    if (!tool) {
      return c.json({ error: 'Tool not found for this agent' }, 404);
    }

    return c.json({ tool });
  } catch (error) {
    console.error('Error fetching tool:', error);
    return c.json({ error: 'Failed to fetch tool' }, 500);
  }
});

// PATCH /api/v2/agents/:agentId/tools/:toolId - Update tool config
app.patch('/:agentId/tools/:toolId', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const toolId = c.req.param('toolId');
    const body = await c.req.json();
    
    if (!agentId || !toolId) {
      return c.json({ error: 'Agent ID and Tool ID are required' }, 400);
    }

    const validatedData = updateToolSchema.parse(body);

    // Check if tool exists for this agent
    const [existingTool] = await db
      .select()
      .from(agentTools)
      .where(
        and(
          eq(agentTools.agentId, agentId),
          eq(agentTools.id, toolId)
        )
      )
      .limit(1);

    if (!existingTool) {
      return c.json({ error: 'Tool not found for this agent' }, 404);
    }

    // Check for name conflicts if updating tool name
    if (validatedData.tool_name && validatedData.tool_name !== existingTool.toolName) {
      const [conflictingTool] = await db
        .select()
        .from(agentTools)
        .where(
          and(
            eq(agentTools.agentId, agentId),
            eq(agentTools.toolName, validatedData.tool_name),
            sql`${agentTools.id} != ${toolId}`
          )
        )
        .limit(1);

      if (conflictingTool) {
        return c.json({ 
          error: 'Tool name conflict',
          message: 'Agent already has a tool with this name'
        }, 409);
      }
    }

    // Update tool
    const updateData: Partial<AgentTool> = {};
    
    if (validatedData.tool_name !== undefined) {
      updateData.toolName = validatedData.tool_name;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }
    if (validatedData.config !== undefined) {
      updateData.config = validatedData.config;
    }
    if (validatedData.is_enabled !== undefined) {
      updateData.isEnabled = validatedData.is_enabled;
    }

    const [updatedTool] = await db
      .update(agentTools)
      .set(updateData)
      .where(eq(agentTools.id, toolId))
      .returning();

    return c.json({ tool: updatedTool });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating tool:', error);
    return c.json({ error: 'Failed to update tool' }, 500);
  }
});

// DELETE /api/v2/agents/:agentId/tools/:toolId - Remove tool
app.delete('/:agentId/tools/:toolId', requireRole('admin'), async (c) => {
  try {
    const agentId = c.req.param('agentId');
    const toolId = c.req.param('toolId');
    
    if (!agentId || !toolId) {
      return c.json({ error: 'Agent ID and Tool ID are required' }, 400);
    }

    // Check if tool exists for this agent
    const [existingTool] = await db
      .select()
      .from(agentTools)
      .where(
        and(
          eq(agentTools.agentId, agentId),
          eq(agentTools.id, toolId)
        )
      )
      .limit(1);

    if (!existingTool) {
      return c.json({ error: 'Tool not found for this agent' }, 404);
    }

    // Delete tool
    await db.delete(agentTools).where(eq(agentTools.id, toolId));

    return c.json({ message: 'Tool removed successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return c.json({ error: 'Failed to delete tool' }, 500);
  }
});

/**
 * Get description for a tool type
 */
function getToolTypeDescription(toolType: string): string {
  const descriptions: Record<string, string> = {
    git: 'Git version control operations (clone, push, pull, commit)',
    shell: 'Shell command execution and system operations',
    http: 'HTTP/REST API calls and web service integration',
    db_query: 'Database query execution and data operations',
    file_ops: 'File system operations (read, write, move, copy)',
    browser: 'Web browser automation and scraping',
    custom: 'Custom tool implementation with specific functionality',
  };

  return descriptions[toolType] || 'Custom tool implementation';
}

export default app;