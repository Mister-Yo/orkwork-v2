import { eq, and, sql, count } from 'drizzle-orm';
import { 
  db, 
  agents, 
  tasks, 
  taskExecutions, 
  agentCapabilities, 
  notifications,
  decisions,
  type Agent, 
  type Task,
  type NewNotification,
  type NewDecision,
} from '../db';
import { logAuditEntry } from '../middleware/audit';

export interface AssignmentScore {
  agentId: string;
  score: number;
  factors: {
    capabilityMatch: number;
    workload: number;
    performance: number;
    costEfficiency: number;
  };
  reasoning: string;
}

export interface AssignmentResult {
  assigned: boolean;
  agentId?: string;
  score?: number;
  reasoning: string;
  allScores?: AssignmentScore[];
}

/**
 * Auto-assign a task to the best available agent
 * Scoring algorithm:
 * - capability_match: does agent have required capabilities? (weight 0.4)
 * - workload: how many active tasks does agent have vs max_concurrent? (weight 0.2)
 * - performance: historical completion rate for similar tasks (weight 0.3) 
 * - cost_efficiency: agent's avg cost per task (weight 0.1)
 */
export async function autoAssignTask(taskId: string): Promise<AssignmentResult> {
  try {
    // Get the task
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      throw new Error('Task not found');
    }

    if (task.assigneeId) {
      return {
        assigned: false,
        reasoning: 'Task is already assigned',
      };
    }

    // Get all active agents
    const activeAgents = await db
      .select()
      .from(agents)
      .where(and(
        eq(agents.status, 'active'),
        eq(agents.autonomyLevel, 'autonomous') // Only autonomous agents can be auto-assigned
      ));

    if (activeAgents.length === 0) {
      await createNotification({
        recipientType: 'user',
        recipientId: '00000000-0000-0000-0000-000000000000', // System notification
        channel: 'web',
        priority: 'high',
        title: 'No agents available for auto-assignment',
        body: `Task "${task.title}" cannot be auto-assigned - no autonomous agents available`,
        metadata: { taskId },
      });

      return {
        assigned: false,
        reasoning: 'No autonomous agents available',
      };
    }

    // Score each agent
    const scores: AssignmentScore[] = [];
    
    for (const agent of activeAgents) {
      const score = await scoreAgent(agent, task);
      scores.push(score);
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);
    
    const bestScore = scores[0];
    const ASSIGNMENT_THRESHOLD = 0.3;

    if (bestScore.score > ASSIGNMENT_THRESHOLD) {
      // Assign the task
      await db
        .update(tasks)
        .set({
          assigneeId: null, // We'll use agentId in task_executions for agent assignments
          status: 'assigned',
          autoAssigned: true,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));

      // Create notification for assigned agent
      await createNotification({
        recipientType: 'agent',
        recipientId: bestScore.agentId,
        channel: 'web',
        priority: task.priority,
        title: 'New task assigned',
        body: `You have been auto-assigned to task: ${task.title}`,
        metadata: { taskId, autoAssigned: true },
      });

      // Log the assignment decision
      await logDecision({
        decisionType: 'task_assign',
        madeBy: '00000000-0000-0000-0000-000000000000', // System user
        context: `Auto-assignment for task: ${task.title}`,
        decision: `Assigned to agent ${bestScore.agentId}`,
        reasoning: bestScore.reasoning,
        taskId,
      });

      // Log audit entry
      await logAuditEntry({
        actorId: '00000000-0000-0000-0000-000000000000',
        actorType: 'system',
        action: 'auto_assign',
        resourceType: 'task',
        resourceId: taskId,
        details: {
          agentId: bestScore.agentId,
          score: bestScore.score,
          factors: bestScore.factors,
        },
      });

      return {
        assigned: true,
        agentId: bestScore.agentId,
        score: bestScore.score,
        reasoning: bestScore.reasoning,
        allScores: scores,
      };
    } else {
      // No suitable agent found
      await createNotification({
        recipientType: 'user',
        recipientId: '00000000-0000-0000-0000-000000000000',
        channel: 'web',
        priority: 'high',
        title: 'No suitable agent for task',
        body: `Task "${task.title}" cannot be auto-assigned - best score ${bestScore.score.toFixed(2)} below threshold ${ASSIGNMENT_THRESHOLD}`,
        metadata: { 
          taskId, 
          bestScore: bestScore.score, 
          threshold: ASSIGNMENT_THRESHOLD,
          topAgents: scores.slice(0, 3),
        },
      });

      return {
        assigned: false,
        reasoning: `Best agent score ${bestScore.score.toFixed(2)} below threshold ${ASSIGNMENT_THRESHOLD}`,
        allScores: scores,
      };
    }
  } catch (error) {
    console.error('Auto-assignment error:', error);
    throw error;
  }
}

/**
 * Score an agent for a specific task
 */
async function scoreAgent(agent: Agent, task: Task): Promise<AssignmentScore> {
  const factors = {
    capabilityMatch: 0,
    workload: 0,
    performance: 0,
    costEfficiency: 0,
  };

  // 1. Capability Match (weight 0.4)
  factors.capabilityMatch = await calculateCapabilityMatch(agent, task);

  // 2. Workload (weight 0.2)
  factors.workload = await calculateWorkloadScore(agent);

  // 3. Performance (weight 0.3)
  factors.performance = await calculatePerformanceScore(agent, task);

  // 4. Cost Efficiency (weight 0.1)
  factors.costEfficiency = await calculateCostEfficiencyScore(agent);

  // Calculate weighted score
  const score = 
    factors.capabilityMatch * 0.4 +
    factors.workload * 0.2 +
    factors.performance * 0.3 +
    factors.costEfficiency * 0.1;

  const reasoning = `Capability: ${(factors.capabilityMatch * 100).toFixed(0)}%, ` +
    `Workload: ${(factors.workload * 100).toFixed(0)}%, ` +
    `Performance: ${(factors.performance * 100).toFixed(0)}%, ` +
    `Cost: ${(factors.costEfficiency * 100).toFixed(0)}% = ` +
    `Total: ${(score * 100).toFixed(0)}%`;

  return {
    agentId: agent.id,
    score,
    factors,
    reasoning,
  };
}

/**
 * Calculate how well agent's capabilities match task requirements
 */
async function calculateCapabilityMatch(agent: Agent, task: Task): Promise<number> {
  // Get agent capabilities
  const agentCaps = await db
    .select()
    .from(agentCapabilities)
    .where(and(
      eq(agentCapabilities.agentId, agent.id),
      eq(agentCapabilities.enabled, true)
    ));

  const agentCapabilitySet = new Set(agentCaps.map(c => c.capability));
  
  // For now, we'll use a simple heuristic based on task priority and type
  // In a real system, this would analyze task.description or have explicit required_capabilities
  const requiredCapabilities = getRequiredCapabilitiesForTask(task);
  
  if (requiredCapabilities.length === 0) {
    return 0.8; // Base score if no specific requirements
  }

  const matchedCapabilities = requiredCapabilities.filter(cap => 
    agentCapabilitySet.has(cap)
  );

  const matchRatio = matchedCapabilities.length / requiredCapabilities.length;
  
  // Also consider proficiency levels
  let avgProficiency = 0;
  if (matchedCapabilities.length > 0) {
    const proficiencies = agentCaps
      .filter(cap => matchedCapabilities.includes(cap.capability))
      .map(cap => cap.proficiency);
    
    avgProficiency = proficiencies.reduce((sum, prof) => sum + prof, 0) / proficiencies.length;
    avgProficiency = avgProficiency / 100; // Convert to 0-1 scale
  }

  // Combine match ratio and proficiency
  return matchRatio * 0.7 + avgProficiency * 0.3;
}

/**
 * Calculate workload score (1.0 = no load, 0.0 = at capacity)
 */
async function calculateWorkloadScore(agent: Agent): Promise<number> {
  // Count active tasks assigned to this agent
  const [result] = await db
    .select({ count: count(taskExecutions.id) })
    .from(taskExecutions)
    .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
    .where(and(
      eq(taskExecutions.agentId, agent.id),
      eq(taskExecutions.status, 'running')
    ));

  const activeTasks = Number(result.count || 0);
  const maxConcurrent = agent.maxConcurrentTasks || 1;
  
  if (activeTasks >= maxConcurrent) {
    return 0; // At capacity
  }
  
  return (maxConcurrent - activeTasks) / maxConcurrent;
}

/**
 * Calculate performance score based on historical completion rate
 */
async function calculatePerformanceScore(agent: Agent, task: Task): Promise<number> {
  // Get completed executions for this agent
  const [completionStats] = await db
    .select({
      total: count(taskExecutions.id),
      successful: count(sql`CASE WHEN ${taskExecutions.status} = 'success' THEN 1 END`),
    })
    .from(taskExecutions)
    .where(eq(taskExecutions.agentId, agent.id));

  const total = Number(completionStats.total || 0);
  const successful = Number(completionStats.successful || 0);

  if (total === 0) {
    return 0.5; // Default score for new agents
  }

  const completionRate = successful / total;
  
  // Boost score slightly for agents with more experience
  const experienceBoost = Math.min(total / 100, 0.1); // Max 10% boost
  
  return Math.min(completionRate + experienceBoost, 1.0);
}

/**
 * Calculate cost efficiency score
 */
async function calculateCostEfficiencyScore(agent: Agent): Promise<number> {
  // Get average cost per successful task
  const [costStats] = await db
    .select({
      avgCost: sql`AVG(${taskExecutions.costUsd})`.as('avgCost'),
      count: count(taskExecutions.id),
    })
    .from(taskExecutions)
    .where(and(
      eq(taskExecutions.agentId, agent.id),
      eq(taskExecutions.status, 'success')
    ));

  const avgCost = Number(costStats.avgCost || 0);
  const taskCount = Number(costStats.count || 0);

  if (taskCount === 0 || avgCost === 0) {
    return 0.5; // Default for agents with no cost history
  }

  // Define cost efficiency thresholds (in cents)
  const EXCELLENT_COST = 100; // $1.00
  const GOOD_COST = 500;      // $5.00
  const POOR_COST = 2000;     // $20.00

  if (avgCost <= EXCELLENT_COST) return 1.0;
  if (avgCost <= GOOD_COST) return 0.8;
  if (avgCost <= POOR_COST) return 0.5;
  
  return 0.2; // High cost agents get low efficiency score
}

/**
 * Determine required capabilities for a task (heuristic)
 */
function getRequiredCapabilitiesForTask(task: Task): string[] {
  const capabilities: string[] = [];
  
  // Analyze task title and description for capability hints
  const text = `${task.title} ${task.description || ''}`.toLowerCase();
  
  if (text.includes('code') || text.includes('programming') || text.includes('develop')) {
    capabilities.push('code:general');
  }
  if (text.includes('typescript') || text.includes('ts')) {
    capabilities.push('code:typescript');
  }
  if (text.includes('python')) {
    capabilities.push('code:python');
  }
  if (text.includes('test') || text.includes('qa')) {
    capabilities.push('qa');
  }
  if (text.includes('review')) {
    capabilities.push('code_review');
  }
  if (text.includes('architecture') || text.includes('design')) {
    capabilities.push('architecture');
  }
  if (text.includes('research') || text.includes('analyze')) {
    capabilities.push('research');
  }
  if (text.includes('write') || text.includes('document')) {
    capabilities.push('writing');
  }

  return capabilities;
}

/**
 * Helper to create notifications
 */
async function createNotification(notification: NewNotification): Promise<void> {
  try {
    await db.insert(notifications).values(notification);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

/**
 * Helper to log decisions
 */
async function logDecision(decision: NewDecision): Promise<void> {
  try {
    await db.insert(decisions).values(decision);
  } catch (error) {
    console.error('Failed to log decision:', error);
  }
}