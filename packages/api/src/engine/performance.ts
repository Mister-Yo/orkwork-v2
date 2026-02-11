import { eq, sql, and, gte, count, desc } from 'drizzle-orm';
import { db, agents, tasks, taskExecutions, costEntries } from '../db';

export interface PerformanceBreakdown {
  completion_rate: {
    score: number;
    weight: number;
    details: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  completion_time: {
    score: number;
    weight: number;
    details: {
      avg_actual_hours: number;
      avg_estimated_hours: number;
      ratio: number;
    };
  };
  quality_score: {
    score: number;
    weight: number;
    details: {
      first_try_completions: number;
      total_completions: number;
      percentage: number;
    };
  };
  bug_rate: {
    score: number;
    weight: number;
    details: {
      rejected_tasks: number;
      total_tasks: number;
      percentage: number;
    };
  };
  cost_efficiency: {
    score: number;
    weight: number;
    details: {
      avg_cost_per_task: number;
      team_average: number;
      efficiency_ratio: number;
    };
  };
  collaboration: {
    score: number;
    weight: number;
    details: {
      tasks_unblocked: number;
      blocking_score: number;
    };
  };
  innovation: {
    score: number;
    weight: number;
    details: {
      sub_tasks_created: number;
      innovation_score: number;
    };
  };
}

export interface PerformanceScore {
  agent_id: string;
  overall_score: number;
  breakdown: PerformanceBreakdown;
  trend: {
    last_7_days: number;
    last_30_days: number;
  };
}

/**
 * Calculate comprehensive agent performance score (0-100)
 */
export async function calculateAgentScore(agentId: string): Promise<PerformanceScore> {
  const breakdown: PerformanceBreakdown = {
    completion_rate: { score: 0, weight: 20, details: { completed: 0, total: 0, percentage: 0 } },
    completion_time: { score: 0, weight: 20, details: { avg_actual_hours: 0, avg_estimated_hours: 0, ratio: 0 } },
    quality_score: { score: 0, weight: 15, details: { first_try_completions: 0, total_completions: 0, percentage: 0 } },
    bug_rate: { score: 0, weight: 15, details: { rejected_tasks: 0, total_tasks: 0, percentage: 0 } },
    cost_efficiency: { score: 0, weight: 15, details: { avg_cost_per_task: 0, team_average: 0, efficiency_ratio: 0 } },
    collaboration: { score: 0, weight: 10, details: { tasks_unblocked: 0, blocking_score: 0 } },
    innovation: { score: 0, weight: 5, details: { sub_tasks_created: 0, innovation_score: 0 } },
  };

  // 1. Task Completion Rate (20%)
  breakdown.completion_rate = await calculateCompletionRate(agentId);

  // 2. Average Completion Time (20%)
  breakdown.completion_time = await calculateCompletionTime(agentId);

  // 3. Quality Score (15%)
  breakdown.quality_score = await calculateQualityScore(agentId);

  // 4. Bug Rate (15%)
  breakdown.bug_rate = await calculateBugRate(agentId);

  // 5. Cost Efficiency (15%)
  breakdown.cost_efficiency = await calculateCostEfficiency(agentId);

  // 6. Collaboration (10%)
  breakdown.collaboration = await calculateCollaboration(agentId);

  // 7. Innovation (5%)
  breakdown.innovation = await calculateInnovation(agentId);

  // Calculate weighted overall score
  const overallScore = Object.values(breakdown).reduce((total, metric) => {
    return total + (metric.score * metric.weight / 100);
  }, 0);

  // Calculate trend scores
  const trend = await calculateTrendScores(agentId);

  return {
    agent_id: agentId,
    overall_score: Math.round(overallScore * 100) / 100,
    breakdown,
    trend,
  };
}

/**
 * Calculate task completion rate (completed / (completed + failed + cancelled))
 */
async function calculateCompletionRate(agentId: string): Promise<PerformanceBreakdown['completion_rate']> {
  const [stats] = await db
    .select({
      total: count(taskExecutions.id),
      completed: count(sql`CASE WHEN ${taskExecutions.status} = 'success' THEN 1 END`),
      failed: count(sql`CASE WHEN ${taskExecutions.status} = 'failed' THEN 1 END`),
    })
    .from(taskExecutions)
    .where(eq(taskExecutions.agentId, agentId));

  const total = Number(stats.total || 0);
  const completed = Number(stats.completed || 0);
  
  if (total === 0) {
    return {
      score: 0,
      weight: 20,
      details: { completed: 0, total: 0, percentage: 0 },
    };
  }

  const percentage = (completed / total) * 100;
  const score = Math.min(percentage / 100, 1); // Normalize to 0-1

  return {
    score,
    weight: 20,
    details: {
      completed,
      total,
      percentage: Math.round(percentage * 100) / 100,
    },
  };
}

/**
 * Calculate completion time performance (actual vs estimated hours)
 */
async function calculateCompletionTime(agentId: string): Promise<PerformanceBreakdown['completion_time']> {
  const [stats] = await db
    .select({
      avgActualHours: sql`AVG(${tasks.actualHours})`.as('avgActualHours'),
      avgEstimatedHours: sql`AVG(${tasks.estimatedHours})`.as('avgEstimatedHours'),
      count: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .where(
      and(
        eq(taskExecutions.agentId, agentId),
        eq(tasks.status, 'completed'),
        sql`${tasks.actualHours} IS NOT NULL`,
        sql`${tasks.estimatedHours} IS NOT NULL`
      )
    );

  const avgActualHours = Number(stats.avgActualHours || 0);
  const avgEstimatedHours = Number(stats.avgEstimatedHours || 0);
  const taskCount = Number(stats.count || 0);

  if (taskCount === 0 || avgEstimatedHours === 0) {
    return {
      score: 0.5, // Default score for no data
      weight: 20,
      details: { avg_actual_hours: 0, avg_estimated_hours: 0, ratio: 0 },
    };
  }

  const ratio = avgActualHours / avgEstimatedHours;
  
  // Score: 1.0 if actual = estimated, decreases as ratio deviates
  let score = 1.0;
  if (ratio > 1.0) {
    // Overran estimate - penalize linearly
    score = Math.max(0, 1.0 - (ratio - 1.0));
  } else {
    // Underran estimate - slight bonus but cap at 1.0
    score = Math.min(1.0, 0.8 + (1.0 - ratio) * 0.2);
  }

  return {
    score,
    weight: 20,
    details: {
      avg_actual_hours: Math.round(avgActualHours * 100) / 100,
      avg_estimated_hours: Math.round(avgEstimatedHours * 100) / 100,
      ratio: Math.round(ratio * 100) / 100,
    },
  };
}

/**
 * Calculate quality score (tasks completed on first try, not returned from review)
 */
async function calculateQualityScore(agentId: string): Promise<PerformanceBreakdown['quality_score']> {
  // Count tasks that went from in_progress directly to completed
  // vs tasks that went to review and back
  const [completedTasksStats] = await db
    .select({
      totalCompleted: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .where(
      and(
        eq(taskExecutions.agentId, agentId),
        eq(tasks.status, 'completed')
      )
    );

  // For simplicity, assume tasks with retryCount = 0 were completed on first try
  const [firstTryStats] = await db
    .select({
      firstTryCompleted: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .where(
      and(
        eq(taskExecutions.agentId, agentId),
        eq(tasks.status, 'completed'),
        eq(tasks.retryCount, 0)
      )
    );

  const totalCompleted = Number(completedTasksStats.totalCompleted || 0);
  const firstTryCompleted = Number(firstTryStats.firstTryCompleted || 0);

  if (totalCompleted === 0) {
    return {
      score: 0,
      weight: 15,
      details: { first_try_completions: 0, total_completions: 0, percentage: 0 },
    };
  }

  const percentage = (firstTryCompleted / totalCompleted) * 100;
  const score = percentage / 100;

  return {
    score,
    weight: 15,
    details: {
      first_try_completions: firstTryCompleted,
      total_completions: totalCompleted,
      percentage: Math.round(percentage * 100) / 100,
    },
  };
}

/**
 * Calculate bug rate (tasks that went to rejected status)
 */
async function calculateBugRate(agentId: string): Promise<PerformanceBreakdown['bug_rate']> {
  const [totalTasksStats] = await db
    .select({
      totalTasks: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .where(eq(taskExecutions.agentId, agentId));

  const [rejectedTasksStats] = await db
    .select({
      rejectedTasks: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .where(
      and(
        eq(taskExecutions.agentId, agentId),
        eq(tasks.status, 'rejected')
      )
    );

  const totalTasks = Number(totalTasksStats.totalTasks || 0);
  const rejectedTasks = Number(rejectedTasksStats.rejectedTasks || 0);

  if (totalTasks === 0) {
    return {
      score: 1, // No data = perfect score
      weight: 15,
      details: { rejected_tasks: 0, total_tasks: 0, percentage: 0 },
    };
  }

  const rejectionPercentage = (rejectedTasks / totalTasks) * 100;
  const score = Math.max(0, 1 - (rejectionPercentage / 100)); // Lower rejection rate = higher score

  return {
    score,
    weight: 15,
    details: {
      rejected_tasks: rejectedTasks,
      total_tasks: totalTasks,
      percentage: Math.round(rejectionPercentage * 100) / 100,
    },
  };
}

/**
 * Calculate cost efficiency (avg cost per completed task vs team average)
 */
async function calculateCostEfficiency(agentId: string): Promise<PerformanceBreakdown['cost_efficiency']> {
  // Get agent's average cost per completed task
  const [agentStats] = await db
    .select({
      avgCost: sql`AVG(${costEntries.amount})`.as('avgCost'),
      completedTasks: count(sql`DISTINCT ${taskExecutions.taskId}`),
    })
    .from(costEntries)
    .innerJoin(taskExecutions, eq(costEntries.agentId, taskExecutions.agentId))
    .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
    .where(
      and(
        eq(costEntries.agentId, agentId),
        eq(tasks.status, 'completed')
      )
    );

  // Get team average cost per task
  const [teamStats] = await db
    .select({
      teamAvgCost: sql`AVG(${costEntries.amount})`.as('teamAvgCost'),
    })
    .from(costEntries)
    .innerJoin(taskExecutions, eq(costEntries.agentId, taskExecutions.agentId))
    .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
    .where(eq(tasks.status, 'completed'));

  const agentAvgCostCents = Number(agentStats.avgCost || 0);
  const teamAvgCostCents = Number(teamStats.teamAvgCost || 1); // Avoid division by zero
  const completedTasks = Number(agentStats.completedTasks || 0);

  if (completedTasks === 0) {
    return {
      score: 0.5, // Default for no data
      weight: 15,
      details: { avg_cost_per_task: 0, team_average: 0, efficiency_ratio: 0 },
    };
  }

  const agentAvgCostUsd = agentAvgCostCents / 100;
  const teamAvgCostUsd = teamAvgCostCents / 100;
  const efficiencyRatio = teamAvgCostUsd / agentAvgCostUsd;

  // Score: 1.0 if agent cost = team average, higher if agent is cheaper
  let score = Math.min(1.0, efficiencyRatio);

  return {
    score,
    weight: 15,
    details: {
      avg_cost_per_task: Math.round(agentAvgCostUsd * 100) / 100,
      team_average: Math.round(teamAvgCostUsd * 100) / 100,
      efficiency_ratio: Math.round(efficiencyRatio * 100) / 100,
    },
  };
}

/**
 * Calculate collaboration score (tasks unblocked by completing dependencies)
 */
async function calculateCollaboration(agentId: string): Promise<PerformanceBreakdown['collaboration']> {
  // Simple heuristic: count completed tasks that were dependencies for other tasks
  const [stats] = await db
    .select({
      unblockedTasks: sql`
        SELECT COUNT(DISTINCT td.task_id) 
        FROM task_dependencies td 
        INNER JOIN tasks t ON td.depends_on_task_id = t.id 
        INNER JOIN task_executions te ON t.id = te.task_id 
        WHERE te.agent_id = ${agentId} AND t.status = 'completed'
      `.as('unblockedTasks'),
    })
    .from(sql`(SELECT 1) dummy`); // Dummy table for the query

  const tasksUnblocked = Number(stats.unblockedTasks || 0);
  
  // Simple scoring: each unblocked task adds to collaboration score
  // Max score of 1.0 at 10 unblocked tasks
  const score = Math.min(1.0, tasksUnblocked / 10);

  return {
    score,
    weight: 10,
    details: {
      tasks_unblocked: tasksUnblocked,
      blocking_score: Math.round(score * 100),
    },
  };
}

/**
 * Calculate innovation score (sub-tasks or improvements created)
 */
async function calculateInnovation(agentId: string): Promise<PerformanceBreakdown['innovation']> {
  // For now, this is a placeholder since we don't track task creation by agents
  // In a real system, you'd track which agent created sub-tasks or suggested improvements
  
  // Placeholder: assume agents who complete more diverse task types are more innovative
  const [stats] = await db
    .select({
      uniqueTaskTypes: sql`COUNT(DISTINCT ${tasks.priority})`.as('uniqueTaskTypes'),
      totalTasks: count(tasks.id),
    })
    .from(tasks)
    .innerJoin(taskExecutions, eq(tasks.id, taskExecutions.taskId))
    .where(eq(taskExecutions.agentId, agentId));

  const uniqueTypes = Number(stats.uniqueTaskTypes || 0);
  const totalTasks = Number(stats.totalTasks || 0);

  if (totalTasks === 0) {
    return {
      score: 0,
      weight: 5,
      details: { sub_tasks_created: 0, innovation_score: 0 },
    };
  }

  // Simple heuristic: diversity of task types indicates innovation
  const diversityScore = Math.min(1.0, uniqueTypes / 4); // Max score at 4 different priority types

  return {
    score: diversityScore,
    weight: 5,
    details: {
      sub_tasks_created: 0, // Placeholder
      innovation_score: Math.round(diversityScore * 100),
    },
  };
}

/**
 * Calculate performance trend (scores for last 7 and 30 days)
 */
async function calculateTrendScores(agentId: string): Promise<{ last_7_days: number; last_30_days: number }> {
  // This is a simplified trend calculation
  // In practice, you'd calculate full scores for different time periods
  
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Simple completion rate trends
  const [recentStats] = await db
    .select({
      recent7Success: count(sql`CASE WHEN ${taskExecutions.status} = 'success' AND ${taskExecutions.startedAt} >= ${sevenDaysAgo} THEN 1 END`),
      recent7Total: count(sql`CASE WHEN ${taskExecutions.startedAt} >= ${sevenDaysAgo} THEN 1 END`),
      recent30Success: count(sql`CASE WHEN ${taskExecutions.status} = 'success' AND ${taskExecutions.startedAt} >= ${thirtyDaysAgo} THEN 1 END`),
      recent30Total: count(sql`CASE WHEN ${taskExecutions.startedAt} >= ${thirtyDaysAgo} THEN 1 END`),
    })
    .from(taskExecutions)
    .where(eq(taskExecutions.agentId, agentId));

  const recent7Success = Number(recentStats.recent7Success || 0);
  const recent7Total = Number(recentStats.recent7Total || 0);
  const recent30Success = Number(recentStats.recent30Success || 0);
  const recent30Total = Number(recentStats.recent30Total || 0);

  const trend7Days = recent7Total > 0 ? (recent7Success / recent7Total) * 100 : 0;
  const trend30Days = recent30Total > 0 ? (recent30Success / recent30Total) * 100 : 0;

  return {
    last_7_days: Math.round(trend7Days * 100) / 100,
    last_30_days: Math.round(trend30Days * 100) / 100,
  };
}