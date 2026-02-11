import { sql, eq, and, gte, lte, count, desc } from 'drizzle-orm';
import { 
  db, 
  tasks, 
  agents, 
  projects, 
  costEntries, 
  decisions, 
  taskExecutions,
  slaRules
} from '../db';

export interface DailyBrief {
  date: string;
  system_health: number;
  summary: {
    tasks_completed_24h: number;
    tasks_created_24h: number;
    tasks_blocked: number;
    tasks_overdue: number;
    active_agents: number;
    total_agents: number;
  };
  budget: {
    daily_spent: number;
    daily_limit: number;
    monthly_spent: number;
    monthly_forecast: number;
  };
  decisions_pending: number;
  sla_violations: number;
  top_events: Array<{
    time: string;
    agent?: string;
    event: string;
    details?: any;
  }>;
  recommendations: string[];
  risks: Array<{
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
}

/**
 * Generate comprehensive daily brief
 */
export async function generateBrief(): Promise<DailyBrief> {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Time ranges
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Calculate all components
  const summary = await calculateSummaryStats(last24h, now, today, tomorrow);
  const budget = await calculateBudgetStats(today, tomorrow);
  const systemHealth = await calculateSystemHealth(summary, budget);
  const decisionsPending = await getDecisionsPending();
  const slaViolations = await getSlaViolations();
  const topEvents = await getTopEvents(last24h);
  const recommendations = await generateRecommendations(summary, budget);
  const risks = await identifyRisks(summary, budget, slaViolations);

  return {
    date: dateStr,
    generatedAt: now.toISOString(),
    system_health: systemHealth,
    summary,
    budget,
    decisions_pending: decisionsPending,
    sla_violations: slaViolations,
    top_events: topEvents,
    recommendations,
    risks,
  };
}

/**
 * Calculate summary statistics
 */
async function calculateSummaryStats(
  last24h: Date, 
  now: Date, 
  today: Date, 
  tomorrow: Date
): Promise<DailyBrief['summary']> {
  // Tasks completed in last 24h
  const [completedStats] = await db
    .select({
      completed24h: count(tasks.id),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.status, 'completed'),
        gte(tasks.completedAt, last24h),
        lte(tasks.completedAt, now)
      )
    );

  // Tasks created in last 24h
  const [createdStats] = await db
    .select({
      created24h: count(tasks.id),
    })
    .from(tasks)
    .where(
      and(
        gte(tasks.createdAt, last24h),
        lte(tasks.createdAt, now)
      )
    );

  // Tasks currently blocked
  const [blockedStats] = await db
    .select({
      blocked: count(tasks.id),
    })
    .from(tasks)
    .where(eq(tasks.status, 'blocked'));

  // Overdue tasks (due date passed but not completed)
  const [overdueStats] = await db
    .select({
      overdue: count(tasks.id),
    })
    .from(tasks)
    .where(
      and(
        sql`${tasks.dueDate} IS NOT NULL`,
        sql`${tasks.dueDate} < NOW()`,
        sql`${tasks.status} NOT IN ('completed', 'cancelled')`
      )
    );

  // Agent counts
  const [agentStats] = await db
    .select({
      activeAgents: count(sql`CASE WHEN ${agents.status} = 'active' THEN 1 END`),
      totalAgents: count(agents.id),
    })
    .from(agents);

  return {
    tasks_completed_24h: Number(completedStats.completed24h || 0),
    tasks_created_24h: Number(createdStats.created24h || 0),
    tasks_blocked: Number(blockedStats.blocked || 0),
    tasks_overdue: Number(overdueStats.overdue || 0),
    active_agents: Number(agentStats.activeAgents || 0),
    total_agents: Number(agentStats.totalAgents || 0),
  };
}

/**
 * Calculate budget statistics
 */
async function calculateBudgetStats(today: Date, tomorrow: Date): Promise<DailyBrief['budget']> {
  // Daily spending (today)
  const [dailyStats] = await db
    .select({
      dailySpent: sql`COALESCE(SUM(${costEntries.amount}), 0)`.as('dailySpent'),
    })
    .from(costEntries)
    .where(
      and(
        gte(costEntries.createdAt, today),
        lte(costEntries.createdAt, tomorrow)
      )
    );

  // Daily limits (sum of all agent budgets)
  const [limitStats] = await db
    .select({
      dailyLimit: sql`COALESCE(SUM(${agents.dailyBudgetUsd}), 0)`.as('dailyLimit'),
    })
    .from(agents)
    .where(eq(agents.status, 'active'));

  // Monthly spending
  const monthStart = new Date(today);
  monthStart.setDate(1);
  
  const [monthlyStats] = await db
    .select({
      monthlySpent: sql`COALESCE(SUM(${costEntries.amount}), 0)`.as('monthlySpent'),
    })
    .from(costEntries)
    .where(gte(costEntries.createdAt, monthStart));

  // Calculate burn rate for forecast
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysPassed = today.getDate();
  const dailyBurnRate = Number(monthlyStats.monthlySpent || 0) / daysPassed;
  const monthlyForecast = dailyBurnRate * daysInMonth;

  return {
    daily_spent: Math.round(Number(dailyStats.dailySpent || 0)) / 100, // Convert to USD
    daily_limit: Math.round(Number(limitStats.dailyLimit || 0)) / 100,
    monthly_spent: Math.round(Number(monthlyStats.monthlySpent || 0)) / 100,
    monthly_forecast: Math.round(monthlyForecast) / 100,
  };
}

/**
 * Calculate system health score (0-100)
 */
async function calculateSystemHealth(
  summary: DailyBrief['summary'], 
  budget: DailyBrief['budget']
): Promise<number> {
  let healthScore = 100;

  // Agent uptime (10% impact)
  const agentUptimeScore = summary.total_agents > 0 ? 
    (summary.active_agents / summary.total_agents) * 100 : 100;
  healthScore -= (100 - agentUptimeScore) * 0.1;

  // Task velocity (30% impact) - completed vs created
  if (summary.tasks_created_24h > 0) {
    const velocityRatio = summary.tasks_completed_24h / summary.tasks_created_24h;
    const velocityScore = Math.min(100, velocityRatio * 100);
    healthScore -= (100 - velocityScore) * 0.3;
  }

  // Budget health (25% impact)
  const budgetUtilization = budget.daily_limit > 0 ? 
    (budget.daily_spent / budget.daily_limit) * 100 : 0;
  let budgetScore = 100;
  if (budgetUtilization > 90) {
    budgetScore = Math.max(0, 100 - (budgetUtilization - 90) * 5); // Penalty for over 90%
  } else if (budgetUtilization < 10) {
    budgetScore = 80; // Slight penalty for very low utilization
  }
  healthScore -= (100 - budgetScore) * 0.25;

  // Blocked/overdue tasks impact (20% impact)
  const totalActiveTasks = summary.tasks_blocked + summary.tasks_overdue + 10; // +10 to avoid division by zero
  const problemTasksRatio = (summary.tasks_blocked + summary.tasks_overdue) / totalActiveTasks;
  const taskHealthScore = Math.max(0, 100 - problemTasksRatio * 200);
  healthScore -= (100 - taskHealthScore) * 0.2;

  // SLA violations impact (15% impact)
  // This would be calculated if we had SLA violation data
  
  return Math.max(0, Math.round(healthScore));
}

/**
 * Get count of pending decisions
 */
async function getDecisionsPending(): Promise<number> {
  const [result] = await db
    .select({
      pendingCount: count(decisions.id),
    })
    .from(decisions)
    .where(sql`${decisions.outcome} IS NULL`);

  return Number(result.pendingCount || 0);
}

/**
 * Get count of SLA violations (placeholder)
 */
async function getSlaViolations(): Promise<number> {
  // Placeholder - would need to implement SLA checking logic
  // For now, return 0
  return 0;
}

/**
 * Get top events from last 24h
 */
async function getTopEvents(since: Date): Promise<DailyBrief['top_events']> {
  const events: DailyBrief['top_events'] = [];

  // Recent task completions
  const recentCompletions = await db
    .select({
      completedAt: tasks.completedAt,
      taskTitle: tasks.title,
      agentName: agents.name,
    })
    .from(tasks)
    .leftJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .leftJoin(agents, eq(taskExecutions.agentId, agents.id))
    .where(
      and(
        eq(tasks.status, 'completed'),
        gte(tasks.completedAt, since)
      )
    )
    .orderBy(desc(tasks.completedAt))
    .limit(5);

  recentCompletions.forEach(completion => {
    if (completion.completedAt) {
      events.push({
        time: completion.completedAt.toISOString(),
        agent: completion.agentName || 'Unknown',
        event: `Completed task: ${completion.taskTitle}`,
      });
    }
  });

  // Recent decisions
  const recentDecisions = await db
    .select({
      createdAt: decisions.createdAt,
      decisionType: decisions.decisionType,
      decision: decisions.decision,
    })
    .from(decisions)
    .where(gte(decisions.createdAt, since))
    .orderBy(desc(decisions.createdAt))
    .limit(3);

  recentDecisions.forEach(decision => {
    events.push({
      time: decision.createdAt.toISOString(),
      event: `Decision made: ${decision.decisionType} - ${decision.decision}`,
    });
  });

  // Sort by time descending
  return events
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);
}

/**
 * Generate recommendations based on current state
 */
async function generateRecommendations(
  summary: DailyBrief['summary'],
  budget: DailyBrief['budget']
): Promise<string[]> {
  const recommendations: string[] = [];

  // Agent workload recommendations
  if (summary.active_agents < summary.total_agents * 0.8) {
    recommendations.push(
      `${summary.total_agents - summary.active_agents} agents are inactive. ` +
      `Consider investigating status or redistributing workload.`
    );
  }

  // Task velocity recommendations  
  if (summary.tasks_completed_24h < summary.tasks_created_24h * 0.5) {
    recommendations.push(
      `Task completion velocity is low (${summary.tasks_completed_24h} completed vs ` +
      `${summary.tasks_created_24h} created). Consider increasing agent capacity.`
    );
  }

  // Blocked tasks recommendations
  if (summary.tasks_blocked > 0) {
    recommendations.push(
      `${summary.tasks_blocked} tasks are currently blocked. ` +
      `Review dependencies and unblock critical path.`
    );
  }

  // Overdue tasks recommendations
  if (summary.tasks_overdue > 0) {
    recommendations.push(
      `${summary.tasks_overdue} tasks are overdue. ` +
      `Review priorities and reassign if necessary.`
    );
  }

  // Budget recommendations
  if (budget.daily_limit > 0) {
    const utilization = (budget.daily_spent / budget.daily_limit) * 100;
    
    if (utilization > 90) {
      recommendations.push(
        `Daily budget utilization is ${utilization.toFixed(1)}%. ` +
        `Monitor spending closely to avoid overrun.`
      );
    } else if (utilization < 20) {
      recommendations.push(
        `Daily budget utilization is low (${utilization.toFixed(1)}%). ` +
        `Consider increasing agent activity or adjusting budgets.`
      );
    }
  }

  // Monthly forecast recommendations
  if (budget.monthly_forecast > budget.monthly_spent * 1.5) {
    recommendations.push(
      `Monthly spending is trending ${((budget.monthly_forecast / budget.monthly_spent - 1) * 100).toFixed(0)}% ` +
      `above current pace. Review cost efficiency.`
    );
  }

  return recommendations;
}

/**
 * Identify system risks
 */
async function identifyRisks(
  summary: DailyBrief['summary'],
  budget: DailyBrief['budget'],
  slaViolations: number
): Promise<DailyBrief['risks']> {
  const risks: DailyBrief['risks'] = [];

  // Critical: No active agents
  if (summary.active_agents === 0) {
    risks.push({
      level: 'critical',
      description: 'No active agents available. System cannot process new tasks.',
    });
  }

  // High: Budget overrun
  if (budget.daily_limit > 0 && budget.daily_spent > budget.daily_limit) {
    risks.push({
      level: 'high',
      description: `Daily budget exceeded by $${(budget.daily_spent - budget.daily_limit).toFixed(2)}`,
    });
  }

  // High: Many blocked tasks
  if (summary.tasks_blocked > 5) {
    risks.push({
      level: 'high',
      description: `${summary.tasks_blocked} tasks are blocked, potentially impacting project timelines.`,
    });
  }

  // Medium: Many overdue tasks
  if (summary.tasks_overdue > 3) {
    risks.push({
      level: 'medium',
      description: `${summary.tasks_overdue} tasks are overdue, affecting delivery schedules.`,
    });
  }

  // Medium: Low agent utilization
  if (summary.total_agents > 0) {
    const utilizationPercent = (summary.active_agents / summary.total_agents) * 100;
    if (utilizationPercent < 50) {
      risks.push({
        level: 'medium',
        description: `Only ${utilizationPercent.toFixed(0)}% of agents are active. Resource underutilization.`,
      });
    }
  }

  // Low: SLA violations (if implemented)
  if (slaViolations > 0) {
    risks.push({
      level: 'low',
      description: `${slaViolations} SLA violations detected in recent period.`,
    });
  }

  return risks;
}