import { eq } from 'drizzle-orm';
import { db, agents, decisions, type Agent, type NewDecision } from '../db';

// Autonomy levels in order of increasing permissions
export type AutonomyLevel = 'tool' | 'assistant' | 'supervised' | 'autonomous' | 'strategic';

// Available actions that require autonomy checks
export type AgentAction = 
  | 'execute_assigned_task'
  | 'suggest_approach' 
  | 'self_assign_task'
  | 'create_subtasks'
  | 'deploy_production'
  | 'delegate_to_agent'
  | 'create_tasks'
  | 'modify_strategy'
  | 'spend_over_10';

// Actions that require decision logging
const DECISION_LOG_ACTIONS: AgentAction[] = [
  'deploy_production',
  'modify_strategy', 
  'spend_over_10'
];

// Minimum autonomy levels required for each action
const ACTION_REQUIREMENTS: Record<AgentAction, AutonomyLevel> = {
  execute_assigned_task: 'tool',
  suggest_approach: 'assistant',
  self_assign_task: 'supervised',
  create_subtasks: 'supervised',
  deploy_production: 'autonomous',
  delegate_to_agent: 'autonomous',
  create_tasks: 'strategic',
  modify_strategy: 'strategic',
  spend_over_10: 'strategic',
};

// Autonomy level hierarchy (higher number = more permissions)
const AUTONOMY_HIERARCHY: Record<AutonomyLevel, number> = {
  tool: 0,
  assistant: 1,
  supervised: 2,
  autonomous: 3,
  strategic: 4,
};

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
  requires_approval?: boolean;
  required_level?: AutonomyLevel;
  current_level?: AutonomyLevel;
}

/**
 * Check if an agent has permission to perform a specific action
 * @param agentId - The agent's ID
 * @param action - The action to check
 * @returns Permission check result
 */
export async function checkPermission(
  agentId: string,
  action: AgentAction
): Promise<PermissionCheckResult> {
  try {
    // Get agent's current autonomy level
    const [agent] = await db
      .select({ autonomyLevel: agents.autonomyLevel })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      return {
        allowed: false,
        reason: 'Agent not found',
      };
    }

    const currentLevel = agent.autonomyLevel;
    const requiredLevel = ACTION_REQUIREMENTS[action];
    
    if (!requiredLevel) {
      return {
        allowed: false,
        reason: 'Unknown action type',
      };
    }

    // Check if agent has sufficient autonomy level
    const currentLevelValue = AUTONOMY_HIERARCHY[currentLevel];
    const requiredLevelValue = AUTONOMY_HIERARCHY[requiredLevel];
    
    const allowed = currentLevelValue >= requiredLevelValue;
    
    if (!allowed) {
      return {
        allowed: false,
        reason: `Insufficient autonomy level. Required: ${requiredLevel}, Current: ${currentLevel}`,
        required_level: requiredLevel,
        current_level: currentLevel,
      };
    }

    // Check if action requires decision logging
    const requiresDecisionLog = DECISION_LOG_ACTIONS.includes(action);
    
    return {
      allowed: true,
      requires_approval: requiresDecisionLog,
      required_level: requiredLevel,
      current_level: currentLevel,
    };
  } catch (error) {
    console.error('Error checking agent permission:', error);
    return {
      allowed: false,
      reason: 'Permission check failed',
    };
  }
}

/**
 * Log a decision made by an agent (for high-autonomy actions)
 * @param agentId - The agent making the decision
 * @param action - The action being performed
 * @param context - Context about the decision
 * @param decision - The actual decision made
 * @param reasoning - Agent's reasoning for the decision
 * @param userId - User ID to associate with the decision (for audit)
 * @param projectId - Optional project ID
 * @param taskId - Optional task ID
 */
export async function logDecision(
  agentId: string,
  action: AgentAction,
  context: string,
  decision: string,
  reasoning: string,
  userId: string,
  projectId?: string,
  taskId?: string
): Promise<void> {
  try {
    const newDecision: NewDecision = {
      decisionType: mapActionToDecisionType(action),
      madeBy: userId, // The user responsible for the agent
      context: `Agent ${agentId} - ${action}: ${context}`,
      decision,
      reasoning,
      projectId: projectId || null,
      taskId: taskId || null,
    };

    await db.insert(decisions).values(newDecision);
    
    console.log(`Logged decision for agent ${agentId}, action: ${action}`);
  } catch (error) {
    console.error('Error logging agent decision:', error);
    throw error;
  }
}

/**
 * Change an agent's autonomy level (requires owner role)
 * @param agentId - The agent's ID
 * @param newLevel - The new autonomy level
 * @param reason - Reason for the change
 * @param userId - ID of the user making the change
 */
export async function changeAutonomyLevel(
  agentId: string,
  newLevel: AutonomyLevel,
  reason: string,
  userId: string
): Promise<Agent> {
  try {
    // Get current agent data
    const [currentAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!currentAgent) {
      throw new Error('Agent not found');
    }

    // Update autonomy level
    const [updatedAgent] = await db
      .update(agents)
      .set({ 
        autonomyLevel: newLevel,
        updatedAt: new Date() 
      })
      .where(eq(agents.id, agentId))
      .returning();

    // Log the change as a decision
    await logDecision(
      agentId,
      'modify_strategy', // Use modify_strategy as the closest action type
      `Autonomy level change from ${currentAgent.autonomyLevel} to ${newLevel}`,
      `Changed autonomy level to ${newLevel}`,
      reason,
      userId
    );

    console.log(
      `Changed autonomy level for agent ${agentId}: ` +
      `${currentAgent.autonomyLevel} -> ${newLevel} (by user ${userId})`
    );

    return updatedAgent;
  } catch (error) {
    console.error('Error changing agent autonomy level:', error);
    throw error;
  }
}

/**
 * Get all possible actions for an agent based on their autonomy level
 * @param agentId - The agent's ID
 * @returns Object mapping actions to whether the agent can perform them
 */
export async function getAgentPermissions(agentId: string): Promise<Record<AgentAction, PermissionCheckResult>> {
  const permissions: Record<AgentAction, PermissionCheckResult> = {} as any;
  
  const actions: AgentAction[] = [
    'execute_assigned_task',
    'suggest_approach',
    'self_assign_task',
    'create_subtasks',
    'deploy_production',
    'delegate_to_agent',
    'create_tasks',
    'modify_strategy',
    'spend_over_10',
  ];

  for (const action of actions) {
    permissions[action] = await checkPermission(agentId, action);
  }

  return permissions;
}

/**
 * Check if an autonomy level change is valid
 * @param currentLevel - Current autonomy level
 * @param newLevel - Proposed new autonomy level
 * @returns Whether the change is valid and any warnings
 */
export function validateAutonomyChange(
  currentLevel: AutonomyLevel,
  newLevel: AutonomyLevel
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  const currentValue = AUTONOMY_HIERARCHY[currentLevel];
  const newValue = AUTONOMY_HIERARCHY[newLevel];
  
  // Check for significant jumps
  if (newValue - currentValue > 2) {
    warnings.push('Large autonomy increase detected. Consider gradual progression.');
  }
  
  // Check for risky levels
  if (newLevel === 'strategic') {
    warnings.push('Strategic level grants maximum autonomy including budget and strategy decisions.');
  }
  
  if (newLevel === 'autonomous' && currentLevel === 'tool') {
    warnings.push('Jumping from tool to autonomous skips intermediate levels.');
  }

  return {
    valid: true, // All changes are technically valid, but may have warnings
    warnings,
  };
}

/**
 * Map an agent action to a decision type for logging
 */
function mapActionToDecisionType(action: AgentAction): 'task_assign' | 'deploy' | 'escalate' | 'approve' | 'budget' {
  const mapping: Record<AgentAction, 'task_assign' | 'deploy' | 'escalate' | 'approve' | 'budget'> = {
    execute_assigned_task: 'task_assign',
    suggest_approach: 'task_assign',
    self_assign_task: 'task_assign',
    create_subtasks: 'task_assign',
    deploy_production: 'deploy',
    delegate_to_agent: 'task_assign',
    create_tasks: 'task_assign',
    modify_strategy: 'approve',
    spend_over_10: 'budget',
  };

  return mapping[action] || 'approve';
}

/**
 * Get recommended autonomy level based on agent performance and history
 * This is a placeholder for future ML-based recommendations
 * @param agentId - The agent's ID
 * @returns Recommended autonomy level with reasoning
 */
export async function getRecommendedAutonomyLevel(agentId: string): Promise<{
  recommended: AutonomyLevel;
  reasoning: string;
  confidence: number; // 0-100
}> {
  // Placeholder implementation - in production this would analyze:
  // - Task success rate
  // - Cost efficiency
  // - Decision quality history
  // - Time since last autonomy change
  
  try {
    const [agent] = await db
      .select({ autonomyLevel: agents.autonomyLevel })
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Simple placeholder logic
    const current = agent.autonomyLevel;
    
    return {
      recommended: current,
      reasoning: 'Insufficient data for recommendation. Current level appears suitable.',
      confidence: 60,
    };
  } catch (error) {
    console.error('Error getting recommended autonomy level:', error);
    throw error;
  }
}