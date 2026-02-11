import { eq, sql, and, gte, count } from 'drizzle-orm';
import { db, agents, tasks, taskExecutions, costEntries, type Agent } from '../db';

export interface AgentHealthReport {
  agent_id: string;
  status: string;
  last_heartbeat: Date | null;
  uptime_hours: number | null;
  current_tasks: number;
  max_concurrent_tasks: number;
  error_rate: number; // percentage
  avg_response_time_ms: number | null;
  daily_budget_usd: number | null;
  daily_spent_usd: number;
  budget_utilization: number; // percentage
  health_score: number; // 0-100
  issues: string[];
}

/**
 * Update agent heartbeat - marks agent as active
 * @param agentId - The agent's ID
 */
export async function updateHeartbeat(agentId: string): Promise<void> {
  try {
    await db
      .update(agents)
      .set({
        status: 'active',
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    console.log(`Heartbeat updated for agent ${agentId}`);
  } catch (error) {
    console.error('Error updating agent heartbeat:', error);
    throw error;
  }
}

/**
 * Get comprehensive health report for an agent
 * @param agentId - The agent's ID
 * @returns Health report with metrics and issues
 */
export async function getHealthReport(agentId: string): Promise<AgentHealthReport> {
  try {
    // Get basic agent info
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Calculate uptime (time since last status change to active)
    const uptimeHours = agent.updatedAt ? 
      (Date.now() - agent.updatedAt.getTime()) / (1000 * 60 * 60) : null;

    // Get current task count
    const [currentTasksResult] = await db
      .select({ count: count(tasks.id) })
      .from(tasks)
      .where(
        and(
          eq(tasks.assigneeId, agentId),
          sql`${tasks.status} IN ('assigned', 'in_progress')`
        )
      );

    const currentTasks = Number(currentTasksResult.count || 0);

    // Get execution stats for the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [executionStats] = await db
      .select({
        totalExecutions: count(taskExecutions.id),
        failedExecutions: count(sql`CASE WHEN ${taskExecutions.status} = 'failed' THEN 1 END`),
        avgDuration: sql`AVG(${taskExecutions.durationMs})`.as('avgDuration'),
      })
      .from(taskExecutions)
      .where(
        and(
          eq(taskExecutions.agentId, agentId),
          gte(taskExecutions.startedAt, twentyFourHoursAgo)
        )
      );

    const totalExecutions = Number(executionStats.totalExecutions || 0);
    const failedExecutions = Number(executionStats.failedExecutions || 0);
    const avgDurationMs = Number(executionStats.avgDuration || 0);

    // Calculate error rate
    const errorRate = totalExecutions > 0 ? (failedExecutions / totalExecutions) * 100 : 0;

    // Get today's spending
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const [costStats] = await db
      .select({
        dailySpent: sql`COALESCE(SUM(${costEntries.amount}), 0)`.as('dailySpent'),
      })
      .from(costEntries)
      .where(
        and(
          eq(costEntries.agentId, agentId),
          gte(costEntries.createdAt, todayStart)
        )
      );

    const dailySpentCents = Number(costStats.dailySpent || 0);
    const dailySpentUsd = dailySpentCents / 100;

    // Calculate budget utilization
    const dailyBudgetUsd = agent.dailyBudgetUsd || 0;
    const budgetUtilization = dailyBudgetUsd > 0 ? (dailySpentUsd / dailyBudgetUsd) * 100 : 0;

    // Identify issues
    const issues: string[] = [];
    
    if (agent.status !== 'active') {
      issues.push(`Agent status is ${agent.status}`);
    }
    
    if (uptimeHours !== null && uptimeHours > 24) {
      issues.push('No heartbeat in over 24 hours');
    }
    
    if (currentTasks >= agent.maxConcurrentTasks) {
      issues.push('At maximum task capacity');
    }
    
    if (errorRate > 25) {
      issues.push(`High error rate: ${errorRate.toFixed(1)}%`);
    }
    
    if (budgetUtilization > 90) {
      issues.push(`Near daily budget limit: ${budgetUtilization.toFixed(1)}%`);
    }
    
    if (avgDurationMs > 300000) { // 5 minutes
      issues.push('Slow average response time');
    }

    // Calculate overall health score (0-100)
    let healthScore = 100;
    
    // Deduct points for issues
    if (agent.status !== 'active') healthScore -= 30;
    if (uptimeHours !== null && uptimeHours > 24) healthScore -= 20;
    if (errorRate > 10) healthScore -= Math.min(30, errorRate);
    if (budgetUtilization > 100) healthScore -= 20;
    if (currentTasks >= agent.maxConcurrentTasks) healthScore -= 10;
    
    healthScore = Math.max(0, healthScore);

    return {
      agent_id: agentId,
      status: agent.status,
      last_heartbeat: agent.updatedAt,
      uptime_hours: uptimeHours,
      current_tasks: currentTasks,
      max_concurrent_tasks: agent.maxConcurrentTasks,
      error_rate: Math.round(errorRate * 100) / 100,
      avg_response_time_ms: avgDurationMs || null,
      daily_budget_usd: dailyBudgetUsd,
      daily_spent_usd: Math.round(dailySpentUsd * 100) / 100,
      budget_utilization: Math.round(budgetUtilization * 100) / 100,
      health_score: Math.round(healthScore),
      issues,
    };
  } catch (error) {
    console.error('Error generating health report:', error);
    throw error;
  }
}

/**
 * Check health of all agents and mark inactive ones as error status
 * This should be run periodically (e.g., every 30 minutes)
 */
export async function checkAgentHealth(): Promise<{
  checked: number;
  marked_error: number;
  healthy: number;
}> {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    // Find all active agents that haven't sent heartbeat in 30+ minutes
    const staleAgents = await db
      .select({ id: agents.id, name: agents.name })
      .from(agents)
      .where(
        and(
          eq(agents.status, 'active'),
          sql`${agents.updatedAt} < ${thirtyMinutesAgo}`
        )
      );

    // Mark stale agents as error
    let markedError = 0;
    for (const agent of staleAgents) {
      await db
        .update(agents)
        .set({ status: 'error' })
        .where(eq(agents.id, agent.id));
      
      console.log(`Marked agent ${agent.name} (${agent.id}) as error due to stale heartbeat`);
      markedError++;
    }

    // Count total agents checked
    const [totalResult] = await db
      .select({ count: count(agents.id) })
      .from(agents);
    
    const totalAgents = Number(totalResult.count || 0);
    const healthyAgents = totalAgents - markedError;

    console.log(`Health check complete: ${totalAgents} checked, ${markedError} marked as error, ${healthyAgents} healthy`);

    return {
      checked: totalAgents,
      marked_error: markedError,
      healthy: healthyAgents,
    };
  } catch (error) {
    console.error('Error during agent health check:', error);
    throw error;
  }
}

/**
 * Get health summary for all agents
 * @returns Summary statistics
 */
export async function getAgentHealthSummary(): Promise<{
  total_agents: number;
  by_status: Record<string, number>;
  avg_health_score: number;
  agents_at_capacity: number;
  agents_over_budget: number;
}> {
  try {
    // Get status breakdown
    const statusBreakdown = await db
      .select({
        status: agents.status,
        count: count(agents.id),
      })
      .from(agents)
      .groupBy(agents.status);

    const byStatus: Record<string, number> = {};
    let totalAgents = 0;
    
    for (const row of statusBreakdown) {
      byStatus[row.status] = Number(row.count);
      totalAgents += Number(row.count);
    }

    // Get agents at capacity (current tasks >= max tasks)
    const [capacityResult] = await db
      .select({ count: count(agents.id) })
      .from(agents)
      .innerJoin(tasks, eq(tasks.assigneeId, agents.id))
      .where(
        and(
          sql`${tasks.status} IN ('assigned', 'in_progress')`,
          sql`(
            SELECT COUNT(*) 
            FROM tasks t 
            WHERE t.assignee_id = ${agents.id} 
            AND t.status IN ('assigned', 'in_progress')
          ) >= ${agents.maxConcurrentTasks}`
        )
      );

    const agentsAtCapacity = Number(capacityResult.count || 0);

    // Calculate approximate metrics (simplified for performance)
    // In production, you might cache these or calculate them differently

    return {
      total_agents: totalAgents,
      by_status: byStatus,
      avg_health_score: 85, // Placeholder - would calculate from individual health reports
      agents_at_capacity: agentsAtCapacity,
      agents_over_budget: 0, // Placeholder - would calculate actual budget overages
    };
  } catch (error) {
    console.error('Error getting agent health summary:', error);
    throw error;
  }
}

/**
 * Get recent health events for monitoring dashboard
 * @param limit - Number of recent events to return
 * @returns Array of recent health-related events
 */
export async function getRecentHealthEvents(limit: number = 10): Promise<Array<{
  timestamp: Date;
  agent_id: string;
  agent_name: string;
  event_type: string;
  description: string;
}>> {
  try {
    // This is a simplified implementation
    // In production, you'd have a dedicated events/alerts table
    
    const recentStatusChanges = await db
      .select({
        timestamp: agents.updatedAt,
        agent_id: agents.id,
        agent_name: agents.name,
        status: agents.status,
      })
      .from(agents)
      .where(sql`${agents.updatedAt} >= NOW() - INTERVAL '24 hours'`)
      .orderBy(sql`${agents.updatedAt} DESC`)
      .limit(limit);

    return recentStatusChanges.map(change => ({
      timestamp: change.timestamp,
      agent_id: change.agent_id,
      agent_name: change.agent_name,
      event_type: 'status_change',
      description: `Agent status changed to ${change.status}`,
    }));
  } catch (error) {
    console.error('Error getting recent health events:', error);
    return [];
  }
}