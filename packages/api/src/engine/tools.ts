import { eq, and } from 'drizzle-orm';
import { db, agentTools, agents, type AgentTool, type NewAgentTool } from '../db';

export type ToolType = 'git' | 'shell' | 'http' | 'db_query' | 'file_ops' | 'browser' | 'custom';

export interface ToolDefinition {
  name: string;
  type: ToolType;
  description: string;
  config_schema?: Record<string, any>;
  required_capabilities?: string[];
}

// Standard tool definitions available in the system
export const STANDARD_TOOLS: Record<string, ToolDefinition> = {
  git_operations: {
    name: 'Git Operations',
    type: 'git',
    description: 'Clone, push, pull, commit, and manage Git repositories',
    config_schema: {
      default_branch: { type: 'string', default: 'main' },
      auto_push: { type: 'boolean', default: false },
      commit_message_template: { type: 'string', default: '[Agent] {description}' },
    },
    required_capabilities: ['git', 'version_control'],
  },
  
  shell_executor: {
    name: 'Shell Executor',
    type: 'shell',
    description: 'Execute shell commands and system operations',
    config_schema: {
      allowed_commands: { type: 'array', items: { type: 'string' } },
      working_directory: { type: 'string', default: '/tmp' },
      timeout_seconds: { type: 'number', default: 300 },
      environment_variables: { type: 'object' },
    },
    required_capabilities: ['system_administration', 'command_line'],
  },
  
  http_client: {
    name: 'HTTP Client',
    type: 'http',
    description: 'Make HTTP requests to APIs and web services',
    config_schema: {
      base_url: { type: 'string' },
      default_headers: { type: 'object' },
      timeout_ms: { type: 'number', default: 30000 },
      retry_attempts: { type: 'number', default: 3 },
    },
    required_capabilities: ['api_integration', 'web_services'],
  },
  
  database_client: {
    name: 'Database Client',
    type: 'db_query',
    description: 'Execute database queries and manage data',
    config_schema: {
      connection_string: { type: 'string' },
      max_connections: { type: 'number', default: 10 },
      query_timeout_ms: { type: 'number', default: 30000 },
      allowed_operations: { type: 'array', items: { type: 'string' } },
    },
    required_capabilities: ['database_management', 'sql'],
  },
  
  file_manager: {
    name: 'File Manager',
    type: 'file_ops',
    description: 'Read, write, move, and organize files',
    config_schema: {
      base_path: { type: 'string', default: '/workspace' },
      allowed_extensions: { type: 'array', items: { type: 'string' } },
      max_file_size_mb: { type: 'number', default: 100 },
      backup_enabled: { type: 'boolean', default: true },
    },
    required_capabilities: ['file_management', 'data_processing'],
  },
  
  web_browser: {
    name: 'Web Browser',
    type: 'browser',
    description: 'Automate web browsing, scraping, and interaction',
    config_schema: {
      headless: { type: 'boolean', default: true },
      user_agent: { type: 'string' },
      page_timeout_ms: { type: 'number', default: 30000 },
      screenshot_enabled: { type: 'boolean', default: false },
    },
    required_capabilities: ['web_scraping', 'browser_automation'],
  },
};

/**
 * Get all available standard tool definitions
 */
export function getStandardTools(): ToolDefinition[] {
  return Object.values(STANDARD_TOOLS);
}

/**
 * Get a specific standard tool definition
 * @param toolName - Name of the standard tool
 */
export function getStandardTool(toolName: string): ToolDefinition | null {
  return STANDARD_TOOLS[toolName] || null;
}

/**
 * Get all tools for a specific agent
 * @param agentId - The agent's ID
 * @param includeDisabled - Whether to include disabled tools
 */
export async function getAgentTools(
  agentId: string, 
  includeDisabled: boolean = false
): Promise<AgentTool[]> {
  try {
    const conditions = [eq(agentTools.agentId, agentId)];
    
    if (!includeDisabled) {
      conditions.push(eq(agentTools.isEnabled, true));
    }

    return await db
      .select()
      .from(agentTools)
      .where(and(...conditions))
      .orderBy(agentTools.toolName);
  } catch (error) {
    console.error('Error getting agent tools:', error);
    throw error;
  }
}

/**
 * Check if an agent has a specific tool
 * @param agentId - The agent's ID
 * @param toolName - Name of the tool to check
 */
export async function agentHasTool(agentId: string, toolName: string): Promise<boolean> {
  try {
    const [tool] = await db
      .select()
      .from(agentTools)
      .where(
        and(
          eq(agentTools.agentId, agentId),
          eq(agentTools.toolName, toolName),
          eq(agentTools.isEnabled, true)
        )
      )
      .limit(1);

    return !!tool;
  } catch (error) {
    console.error('Error checking if agent has tool:', error);
    return false;
  }
}

/**
 * Add a standard tool to an agent
 * @param agentId - The agent's ID
 * @param standardToolKey - Key of the standard tool
 * @param customConfig - Optional custom configuration
 */
export async function addStandardTool(
  agentId: string,
  standardToolKey: string,
  customConfig?: Record<string, any>
): Promise<AgentTool> {
  try {
    const standardTool = STANDARD_TOOLS[standardToolKey];
    if (!standardTool) {
      throw new Error(`Unknown standard tool: ${standardToolKey}`);
    }

    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if tool already exists
    const existingTool = await agentHasTool(agentId, standardToolKey);
    if (existingTool) {
      throw new Error('Agent already has this tool');
    }

    // Merge default config with custom config
    const config = {
      ...standardTool.config_schema,
      ...customConfig,
    };

    const newTool: NewAgentTool = {
      agentId,
      toolName: standardToolKey,
      toolType: standardTool.type,
      description: standardTool.description,
      config,
      isEnabled: true,
    };

    const [createdTool] = await db.insert(agentTools).values(newTool).returning();

    console.log(`Added standard tool ${standardToolKey} to agent ${agentId}`);
    return createdTool;
  } catch (error) {
    console.error('Error adding standard tool:', error);
    throw error;
  }
}

/**
 * Create a custom tool for an agent
 * @param agentId - The agent's ID
 * @param toolDefinition - Custom tool definition
 */
export async function createCustomTool(
  agentId: string,
  toolDefinition: {
    name: string;
    description?: string;
    config?: Record<string, any>;
  }
): Promise<AgentTool> {
  try {
    // Check if agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if tool name already exists for this agent
    const existingTool = await agentHasTool(agentId, toolDefinition.name);
    if (existingTool) {
      throw new Error('Agent already has a tool with this name');
    }

    const newTool: NewAgentTool = {
      agentId,
      toolName: toolDefinition.name,
      toolType: 'custom',
      description: toolDefinition.description || null,
      config: toolDefinition.config || {},
      isEnabled: true,
    };

    const [createdTool] = await db.insert(agentTools).values(newTool).returning();

    console.log(`Created custom tool ${toolDefinition.name} for agent ${agentId}`);
    return createdTool;
  } catch (error) {
    console.error('Error creating custom tool:', error);
    throw error;
  }
}

/**
 * Update tool configuration
 * @param agentId - The agent's ID
 * @param toolId - The tool's ID
 * @param updates - Configuration updates
 */
export async function updateToolConfig(
  agentId: string,
  toolId: string,
  updates: {
    description?: string;
    config?: Record<string, any>;
    isEnabled?: boolean;
  }
): Promise<AgentTool> {
  try {
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
      throw new Error('Tool not found for this agent');
    }

    // Build update object
    const updateData: Partial<AgentTool> = {};
    
    if (updates.description !== undefined) {
      updateData.description = updates.description;
    }
    if (updates.config !== undefined) {
      updateData.config = updates.config;
    }
    if (updates.isEnabled !== undefined) {
      updateData.isEnabled = updates.isEnabled;
    }

    const [updatedTool] = await db
      .update(agentTools)
      .set(updateData)
      .where(eq(agentTools.id, toolId))
      .returning();

    console.log(`Updated tool ${existingTool.toolName} for agent ${agentId}`);
    return updatedTool;
  } catch (error) {
    console.error('Error updating tool config:', error);
    throw error;
  }
}

/**
 * Remove a tool from an agent
 * @param agentId - The agent's ID
 * @param toolId - The tool's ID
 */
export async function removeTool(agentId: string, toolId: string): Promise<void> {
  try {
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
      throw new Error('Tool not found for this agent');
    }

    await db.delete(agentTools).where(eq(agentTools.id, toolId));

    console.log(`Removed tool ${existingTool.toolName} from agent ${agentId}`);
  } catch (error) {
    console.error('Error removing tool:', error);
    throw error;
  }
}

/**
 * Get tools by type across all agents
 * @param toolType - Type of tools to find
 * @param enabledOnly - Only return enabled tools
 */
export async function getToolsByType(
  toolType: ToolType,
  enabledOnly: boolean = true
): Promise<Array<AgentTool & { agent_name: string }>> {
  try {
    const conditions = [eq(agentTools.toolType, toolType)];
    
    if (enabledOnly) {
      conditions.push(eq(agentTools.isEnabled, true));
    }

    return await db
      .select({
        id: agentTools.id,
        agentId: agentTools.agentId,
        toolName: agentTools.toolName,
        toolType: agentTools.toolType,
        description: agentTools.description,
        config: agentTools.config,
        isEnabled: agentTools.isEnabled,
        createdAt: agentTools.createdAt,
        agent_name: agents.name,
      })
      .from(agentTools)
      .innerJoin(agents, eq(agentTools.agentId, agents.id))
      .where(and(...conditions))
      .orderBy(agentTools.toolName);
  } catch (error) {
    console.error('Error getting tools by type:', error);
    throw error;
  }
}

/**
 * Validate tool configuration against schema
 * @param toolName - Name of the tool (for standard tools)
 * @param config - Configuration to validate
 * @returns Validation result
 */
export function validateToolConfig(
  toolName: string,
  config: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // For standard tools, validate against schema
  const standardTool = STANDARD_TOOLS[toolName];
  if (standardTool && standardTool.config_schema) {
    // Simple validation - in production you'd use a proper JSON schema validator
    for (const [key, schema] of Object.entries(standardTool.config_schema)) {
      if (schema.type && config[key] !== undefined) {
        const actualType = typeof config[key];
        const expectedType = schema.type === 'array' ? 'object' : schema.type;
        
        if (actualType !== expectedType) {
          errors.push(`Invalid type for ${key}: expected ${expectedType}, got ${actualType}`);
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}