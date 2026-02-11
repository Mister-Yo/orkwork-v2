import { sql, eq, and, gte, lte, count, desc } from 'drizzle-orm';
import { 
  db, 
  projects, 
  tasks, 
  costEntries, 
  taskDependencies,
  agents,
  taskExecutions 
} from '../db';

export interface ProjectForecast {
  project_id: string;
  project_name: string;
  current_status: {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    blocked_tasks: number;
    completion_percentage: number;
  };
  velocity: {
    tasks_per_day: number;
    tasks_completed_last_7_days: number;
    tasks_completed_last_30_days: number;
  };
  estimated_completion: {
    date: string | null;
    days_remaining: number | null;
    confidence: 'high' | 'medium' | 'low';
  };
  risks: string[];
}

export interface CostForecast {
  period_days: number;
  current_daily_burn_rate: number;
  forecasted_cost: number;
  confidence_interval: {
    min: number;
    max: number;
  };
  breakdown: {
    by_agent: Array<{
      agent_id: string;
      agent_name: string;
      forecasted_cost: number;
    }>;
    by_cost_type: Array<{
      cost_type: string;
      forecasted_cost: number;
    }>;
  };
}

export interface BottleneckAnalysis {
  critical_path_tasks: Array<{
    task_id: string;
    task_title: string;
    blocking_count: number;
    estimated_hours: number;
    status: string;
  }>;
  agent_bottlenecks: Array<{
    agent_id: string;
    agent_name: string;
    workload_utilization: number;
    blocking_tasks: number;
  }>;
  dependency_chains: Array<{
    chain_length: number;
    tasks: string[];
    estimated_total_hours: number;
  }>;
}

/**
 * Generate project completion forecast based on velocity
 */
export async function projectForecast(projectId: string): Promise<ProjectForecast | null> {
  // Get project info
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return null;
  }

  // Get current task status
  const [taskStats] = await db
    .select({
      totalTasks: count(tasks.id),
      completedTasks: count(sql`CASE WHEN ${tasks.status} = 'completed' THEN 1 END`),
      inProgressTasks: count(sql`CASE WHEN ${tasks.status} = 'in_progress' THEN 1 END`),
      blockedTasks: count(sql`CASE WHEN ${tasks.status} = 'blocked' THEN 1 END`),
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId));

  const totalTasks = Number(taskStats.totalTasks || 0);
  const completedTasks = Number(taskStats.completedTasks || 0);
  const inProgressTasks = Number(taskStats.inProgressTasks || 0);
  const blockedTasks = Number(taskStats.blockedTasks || 0);
  const remainingTasks = totalTasks - completedTasks;

  // Calculate velocity (tasks completed per day)
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [velocityStats] = await db
    .select({
      completed7Days: count(sql`CASE WHEN ${tasks.completedAt} >= ${sevenDaysAgo} THEN 1 END`),
      completed30Days: count(sql`CASE WHEN ${tasks.completedAt} >= ${thirtyDaysAgo} THEN 1 END`),
    })
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, projectId),
        eq(tasks.status, 'completed')
      )
    );

  const completed7Days = Number(velocityStats.completed7Days || 0);
  const completed30Days = Number(velocityStats.completed30Days || 0);
  
  // Calculate daily velocity (prefer 7-day average, fallback to 30-day)
  const tasksPerDay = completed7Days > 0 ? 
    completed7Days / 7 : 
    (completed30Days > 0 ? completed30Days / 30 : 0);

  // Estimate completion date
  let estimatedDate: string | null = null;
  let daysRemaining: number | null = null;
  let confidence: 'high' | 'medium' | 'low' = 'low';

  if (tasksPerDay > 0 && remainingTasks > 0) {
    daysRemaining = Math.ceil(remainingTasks / tasksPerDay);
    const completionDate = new Date(now.getTime() + daysRemaining * 24 * 60 * 60 * 1000);
    estimatedDate = completionDate.toISOString().split('T')[0];

    // Determine confidence based on data points and blockers
    if (completed7Days >= 3 && blockedTasks === 0) {
      confidence = 'high';
    } else if (completed7Days >= 1 || completed30Days >= 5) {
      confidence = 'medium';
    } else {
      confidence = 'low';
    }
  }

  // Identify risks
  const risks: string[] = [];
  
  if (blockedTasks > 0) {
    risks.push(`${blockedTasks} tasks are currently blocked`);
  }
  
  if (tasksPerDay === 0) {
    risks.push('No recent task completions - unable to estimate velocity');
  }
  
  if (tasksPerDay > 0 && daysRemaining && daysRemaining > 90) {
    risks.push('Estimated completion is more than 3 months away');
  }
  
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  if (completionPercentage < 10 && totalTasks > 10) {
    risks.push('Project is in very early stages with low completion rate');
  }

  return {
    project_id: projectId,
    project_name: project.name,
    current_status: {
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      in_progress_tasks: inProgressTasks,
      blocked_tasks: blockedTasks,
      completion_percentage: Math.round(completionPercentage * 100) / 100,
    },
    velocity: {
      tasks_per_day: Math.round(tasksPerDay * 100) / 100,
      tasks_completed_last_7_days: completed7Days,
      tasks_completed_last_30_days: completed30Days,
    },
    estimated_completion: {
      date: estimatedDate,
      days_remaining: daysRemaining,
      confidence,
    },
    risks,
  };
}

/**
 * Project cost for next N days based on burn rate
 */
export async function costForecast(days: number): Promise<CostForecast> {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Calculate current daily burn rate from last 30 days
  const [burnRateStats] = await db
    .select({
      totalCost: sql`COALESCE(SUM(${costEntries.amount}), 0)`.as('totalCost'),
      dayCount: sql`COUNT(DISTINCT DATE(${costEntries.createdAt}))`.as('dayCount'),
    })
    .from(costEntries)
    .where(gte(costEntries.createdAt, last30Days));

  const totalCostCents = Number(burnRateStats.totalCost || 0);
  const dayCount = Number(burnRateStats.dayCount || 1);
  const dailyBurnRateCents = totalCostCents / dayCount;
  const dailyBurnRateUsd = dailyBurnRateCents / 100;

  // Calculate variance for confidence interval (simplified)
  const [dailyCosts] = await db
    .select({
      dailyCosts: sql`array_agg(daily_cost)`.as('dailyCosts'),
    })
    .from(
      sql`(
        SELECT DATE(${costEntries.createdAt}) as date, SUM(${costEntries.amount}) as daily_cost
        FROM ${costEntries}
        WHERE ${costEntries.createdAt} >= ${last30Days}
        GROUP BY DATE(${costEntries.createdAt})
      ) daily_totals`
    );

  // Simple variance calculation (in practice, you'd want more sophisticated forecasting)
  const forecastedCostCents = dailyBurnRateCents * days;
  const varianceMultiplier = 0.2; // ±20% confidence interval
  const minCostCents = forecastedCostCents * (1 - varianceMultiplier);
  const maxCostCents = forecastedCostCents * (1 + varianceMultiplier);

  // Breakdown by agent
  const agentBreakdown = await db
    .select({
      agentId: costEntries.agentId,
      agentName: agents.name,
      avgDailyCost: sql`AVG(daily_cost)`.as('avgDailyCost'),
    })
    .from(
      sql`(
        SELECT 
          ${costEntries.agentId} as agent_id,
          DATE(${costEntries.createdAt}) as date, 
          SUM(${costEntries.amount}) as daily_cost
        FROM ${costEntries}
        WHERE ${costEntries.createdAt} >= ${last30Days}
        GROUP BY ${costEntries.agentId}, DATE(${costEntries.createdAt})
      ) agent_daily_costs`
    )
    .leftJoin(agents, eq(sql`agent_daily_costs.agent_id`, agents.id))
    .groupBy(sql`agent_daily_costs.agent_id`, agents.name);

  // Breakdown by cost type
  const costTypeBreakdown = await db
    .select({
      costType: costEntries.costType,
      avgDailyCost: sql`AVG(daily_cost)`.as('avgDailyCost'),
    })
    .from(
      sql`(
        SELECT 
          ${costEntries.costType} as cost_type,
          DATE(${costEntries.createdAt}) as date, 
          SUM(${costEntries.amount}) as daily_cost
        FROM ${costEntries}
        WHERE ${costEntries.createdAt} >= ${last30Days}
        GROUP BY ${costEntries.costType}, DATE(${costEntries.createdAt})
      ) type_daily_costs`
    )
    .groupBy(sql`type_daily_costs.cost_type`);

  return {
    period_days: days,
    current_daily_burn_rate: Math.round(dailyBurnRateUsd * 100) / 100,
    forecasted_cost: Math.round(forecastedCostCents / 100 * 100) / 100,
    confidence_interval: {
      min: Math.round(minCostCents / 100 * 100) / 100,
      max: Math.round(maxCostCents / 100 * 100) / 100,
    },
    breakdown: {
      by_agent: agentBreakdown.map(item => ({
        agent_id: item.agentId || '',
        agent_name: item.agentName || 'Unknown',
        forecasted_cost: Math.round(Number(item.avgDailyCost || 0) * days / 100 * 100) / 100,
      })),
      by_cost_type: costTypeBreakdown.map(item => ({
        cost_type: item.costType || 'unknown',
        forecasted_cost: Math.round(Number(item.avgDailyCost || 0) * days / 100 * 100) / 100,
      })),
    },
  };
}

/**
 * Identify bottlenecks in the system
 */
export async function bottleneckDetection(): Promise<BottleneckAnalysis> {
  // Find tasks that are blocking the most other tasks (critical path)
  const criticalPathTasks = await db
    .select({
      taskId: tasks.id,
      taskTitle: tasks.title,
      estimatedHours: tasks.estimatedHours,
      status: tasks.status,
      blockingCount: sql`COUNT(${taskDependencies.taskId})`.as('blockingCount'),
    })
    .from(tasks)
    .leftJoin(taskDependencies, eq(tasks.id, taskDependencies.dependsOnTaskId))
    .where(sql`${tasks.status} NOT IN ('completed', 'cancelled')`)
    .groupBy(tasks.id, tasks.title, tasks.estimatedHours, tasks.status)
    .having(sql`COUNT(${taskDependencies.taskId}) > 0`)
    .orderBy(desc(sql`COUNT(${taskDependencies.taskId})`))
    .limit(10);

  // Find agents with high workload utilization
  const agentBottlenecks = await db
    .select({
      agentId: agents.id,
      agentName: agents.name,
      maxConcurrentTasks: agents.maxConcurrentTasks,
      currentTasks: sql`COUNT(${taskExecutions.id})`.as('currentTasks'),
      blockingTasksCount: sql`
        SELECT COUNT(DISTINCT td.task_id)
        FROM ${taskDependencies} td
        INNER JOIN ${tasks} t ON td.depends_on_task_id = t.id
        INNER JOIN ${taskExecutions} te ON t.id = te.task_id
        WHERE te.agent_id = ${agents.id} 
        AND t.status NOT IN ('completed', 'cancelled')
        AND td.dependency_type = 'blocks'
      `.as('blockingTasksCount'),
    })
    .from(agents)
    .leftJoin(taskExecutions, 
      and(
        eq(taskExecutions.agentId, agents.id),
        eq(taskExecutions.status, 'running')
      )
    )
    .where(eq(agents.status, 'active'))
    .groupBy(agents.id, agents.name, agents.maxConcurrentTasks)
    .having(sql`COUNT(${taskExecutions.id}) > 0`);

  // Find longest dependency chains
  // This is a simplified version - in practice, you'd want recursive CTE for full chain analysis
  const dependencyChains = await db
    .select({
      taskId: tasks.id,
      taskTitle: tasks.title,
      estimatedHours: tasks.estimatedHours,
      directDependencies: sql`COUNT(${taskDependencies.dependsOnTaskId})`.as('directDependencies'),
      totalEstimatedHours: sql`
        COALESCE(${tasks.estimatedHours}, 0) + 
        COALESCE(SUM(dep_tasks.estimated_hours), 0)
      `.as('totalEstimatedHours'),
    })
    .from(tasks)
    .leftJoin(taskDependencies, eq(tasks.id, taskDependencies.taskId))
    .leftJoin(sql`tasks dep_tasks`, sql`dep_tasks.id = ${taskDependencies.dependsOnTaskId}`)
    .where(sql`${tasks.status} NOT IN ('completed', 'cancelled')`)
    .groupBy(tasks.id, tasks.title, tasks.estimatedHours)
    .having(sql`COUNT(${taskDependencies.dependsOnTaskId}) > 0`)
    .orderBy(desc(sql`COUNT(${taskDependencies.dependsOnTaskId})`))
    .limit(5);

  return {
    critical_path_tasks: criticalPathTasks.map(task => ({
      task_id: task.taskId,
      task_title: task.taskTitle,
      blocking_count: Number(task.blockingCount),
      estimated_hours: Number(task.estimatedHours || 0),
      status: task.status,
    })),
    agent_bottlenecks: agentBottlenecks.map(agent => ({
      agent_id: agent.agentId,
      agent_name: agent.agentName,
      workload_utilization: agent.maxConcurrentTasks ? 
        Math.round((Number(agent.currentTasks) / agent.maxConcurrentTasks) * 100) : 0,
      blocking_tasks: Number(agent.blockingTasksCount || 0),
    })).filter(agent => agent.workload_utilization > 70), // Only show high utilization
    dependency_chains: dependencyChains.map(chain => ({
      chain_length: Number(chain.directDependencies),
      tasks: [chain.taskId], // Simplified - would need recursive query for full chains
      estimated_total_hours: Number(chain.totalEstimatedHours || 0),
    })),
  };
}