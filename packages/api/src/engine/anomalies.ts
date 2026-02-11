import { sql, eq, and, gte, lte, count, desc } from 'drizzle-orm';
import { 
  db, 
  agents, 
  tasks, 
  taskExecutions, 
  costEntries,
  taskDependencies,
  projects 
} from '../db';

export interface Anomaly {
  id: string;
  type: 'agent_inactive' | 'token_spike' | 'repeated_failures' | 'circular_blocking' | 'budget_overrun' | 'stale_tasks';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  detected_at: string;
  affected_resources: {
    agents?: string[];
    tasks?: string[];
    projects?: string[];
  };
  metrics?: {
    threshold?: number;
    actual?: number;
    [key: string]: any;
  };
  suggested_actions?: string[];
}

/**
 * Detect all types of anomalies and return them sorted by severity
 */
export async function detectAnomalies(): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  const now = new Date();

  // Run all detection functions
  const detectionPromises = [
    detectInactiveAgents(now),
    detectTokenSpikes(now),
    detectRepeatedFailures(now),
    detectCircularBlocking(),
    detectBudgetOverruns(now),
    detectStaleTasks(now),
  ];

  const results = await Promise.all(detectionPromises);
  
  // Flatten and sort by severity
  const allAnomalies = results.flat();
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  
  return allAnomalies.sort((a, b) => 
    severityOrder[a.severity] - severityOrder[b.severity]
  );
}

/**
 * Detect agents that are active but haven't executed tasks recently
 */
async function detectInactiveAgents(now: Date): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  const thresholdMinutes = 30;
  const thresholdTime = new Date(now.getTime() - thresholdMinutes * 60 * 1000);

  // Get active agents
  const activeAgents = await db
    .select({
      id: agents.id,
      name: agents.name,
      lastExecution: sql`
        SELECT MAX(${taskExecutions.startedAt}) 
        FROM ${taskExecutions} 
        WHERE ${taskExecutions.agentId} = ${agents.id}
      `.as('lastExecution'),
    })
    .from(agents)
    .where(eq(agents.status, 'active'));

  for (const agent of activeAgents) {
    const lastExecution = agent.lastExecution as Date | null;
    
    if (!lastExecution || lastExecution < thresholdTime) {
      const minutesInactive = lastExecution ? 
        Math.floor((now.getTime() - lastExecution.getTime()) / (1000 * 60)) :
        'unknown';

      anomalies.push({
        id: `agent_inactive_${agent.id}`,
        type: 'agent_inactive',
        severity: 'warning',
        title: `Agent ${agent.name} appears inactive`,
        description: `Agent has been active but hasn't executed tasks for ${minutesInactive} minutes (threshold: ${thresholdMinutes}min)`,
        detected_at: now.toISOString(),
        affected_resources: {
          agents: [agent.id],
        },
        metrics: {
          threshold: thresholdMinutes,
          actual: minutesInactive,
        },
        suggested_actions: [
          'Check agent health status',
          'Review task assignment logic',
          'Verify agent connectivity',
        ],
      });
    }
  }

  return anomalies;
}

/**
 * Detect token usage spikes (last hour > 3x 24h average)
 */
async function detectTokenSpikes(now: Date): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  const lastHour = new Date(now.getTime() - 60 * 60 * 1000);
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Get token usage for each agent
  const agentTokenStats = await db
    .select({
      agentId: costEntries.agentId,
      agentName: agents.name,
      tokensLastHour: sql`
        COALESCE(SUM(CASE WHEN ${costEntries.createdAt} >= ${lastHour} THEN ${costEntries.tokenCount} END), 0)
      `.as('tokensLastHour'),
      tokens24h: sql`
        COALESCE(SUM(CASE WHEN ${costEntries.createdAt} >= ${last24Hours} THEN ${costEntries.tokenCount} END), 0)
      `.as('tokens24h'),
    })
    .from(costEntries)
    .leftJoin(agents, eq(costEntries.agentId, agents.id))
    .where(gte(costEntries.createdAt, last24Hours))
    .groupBy(costEntries.agentId, agents.name)
    .having(sql`SUM(${costEntries.tokenCount}) > 0`);

  for (const stats of agentTokenStats) {
    const tokensLastHour = Number(stats.tokensLastHour);
    const tokens24h = Number(stats.tokens24h);
    const avg24hPerHour = tokens24h / 24;
    
    if (avg24hPerHour > 0 && tokensLastHour > avg24hPerHour * 3) {
      const spikeMultiplier = Math.round(tokensLastHour / avg24hPerHour * 10) / 10;
      
      anomalies.push({
        id: `token_spike_${stats.agentId}`,
        type: 'token_spike',
        severity: spikeMultiplier > 5 ? 'critical' : 'warning',
        title: `Token usage spike detected for ${stats.agentName}`,
        description: `Agent used ${tokensLastHour.toLocaleString()} tokens in the last hour (${spikeMultiplier}x the 24h average)`,
        detected_at: now.toISOString(),
        affected_resources: {
          agents: [stats.agentId],
        },
        metrics: {
          threshold: avg24hPerHour * 3,
          actual: tokensLastHour,
          spike_multiplier: spikeMultiplier,
          average_per_hour: Math.round(avg24hPerHour),
        },
        suggested_actions: [
          'Review recent tasks for complexity',
          'Check for infinite loops or retry storms',
          'Monitor cost impact',
        ],
      });
    }
  }

  return anomalies;
}

/**
 * Detect repeated failures (same agent failed > 3 tasks in 24h)
 */
async function detectRepeatedFailures(now: Date): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const failureThreshold = 3;

  const agentFailureStats = await db
    .select({
      agentId: taskExecutions.agentId,
      agentName: agents.name,
      failureCount: count(taskExecutions.id),
      failedTasks: sql`array_agg(${tasks.title})`.as('failedTasks'),
    })
    .from(taskExecutions)
    .leftJoin(agents, eq(taskExecutions.agentId, agents.id))
    .leftJoin(tasks, eq(taskExecutions.taskId, tasks.id))
    .where(
      and(
        eq(taskExecutions.status, 'failed'),
        gte(taskExecutions.startedAt, last24Hours)
      )
    )
    .groupBy(taskExecutions.agentId, agents.name)
    .having(sql`COUNT(${taskExecutions.id}) > ${failureThreshold}`);

  for (const stats of agentFailureStats) {
    const failureCount = Number(stats.failureCount);
    
    anomalies.push({
      id: `repeated_failures_${stats.agentId}`,
      type: 'repeated_failures',
      severity: failureCount > 5 ? 'critical' : 'warning',
      title: `Repeated failures detected for ${stats.agentName}`,
      description: `Agent has failed ${failureCount} tasks in the last 24 hours (threshold: ${failureThreshold})`,
      detected_at: now.toISOString(),
      affected_resources: {
        agents: [stats.agentId],
      },
      metrics: {
        threshold: failureThreshold,
        actual: failureCount,
        failed_tasks: stats.failedTasks,
      },
      suggested_actions: [
        'Review agent configuration and capabilities',
        'Check recent error patterns',
        'Consider task reassignment',
        'Investigate system issues',
      ],
    });
  }

  return anomalies;
}

/**
 * Detect circular blocking (tasks blocking each other in a cycle)
 */
async function detectCircularBlocking(): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Get all blocking dependencies
  const dependencies = await db
    .select({
      taskId: taskDependencies.taskId,
      dependsOnTaskId: taskDependencies.dependsOnTaskId,
      taskTitle: sql`t1.title`.as('taskTitle'),
      dependsOnTitle: sql`t2.title`.as('dependsOnTitle'),
      taskStatus: sql`t1.status`.as('taskStatus'),
      dependsOnStatus: sql`t2.status`.as('dependsOnStatus'),
    })
    .from(taskDependencies)
    .innerJoin(sql`tasks t1`, sql`t1.id = ${taskDependencies.taskId}`)
    .innerJoin(sql`tasks t2`, sql`t2.id = ${taskDependencies.dependsOnTaskId}`)
    .where(
      and(
        eq(taskDependencies.dependencyType, 'blocks'),
        sql`t1.status NOT IN ('completed', 'cancelled')`,
        sql`t2.status NOT IN ('completed', 'cancelled')`
      )
    );

  // Simple cycle detection (2-task cycles)
  const taskMap = new Map<string, string[]>();
  
  dependencies.forEach(dep => {
    if (!taskMap.has(dep.taskId)) {
      taskMap.set(dep.taskId, []);
    }
    taskMap.get(dep.taskId)!.push(dep.dependsOnTaskId);
  });

  const checkedPairs = new Set<string>();
  
  for (const [taskA, dependencies] of taskMap) {
    for (const taskB of dependencies) {
      const pairKey = [taskA, taskB].sort().join('-');
      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);
      
      // Check if taskB also depends on taskA (2-cycle)
      const taskBDeps = taskMap.get(taskB) || [];
      if (taskBDeps.includes(taskA)) {
        const taskAInfo = dependencies.find(d => d.taskId === taskA);
        const taskBInfo = dependencies.find(d => d.taskId === taskB);
        
        anomalies.push({
          id: `circular_blocking_${taskA}_${taskB}`,
          type: 'circular_blocking',
          severity: 'critical',
          title: 'Circular dependency detected',
          description: `Tasks "${taskAInfo?.taskTitle}" and "${taskBInfo?.taskTitle}" are blocking each other`,
          detected_at: new Date().toISOString(),
          affected_resources: {
            tasks: [taskA, taskB],
          },
          suggested_actions: [
            'Review task dependencies and remove circular references',
            'Break down tasks to eliminate dependencies',
            'Manually resolve one of the blocking tasks',
          ],
        });
      }
    }
  }

  return anomalies;
}

/**
 * Detect budget overruns (agent or project exceeded budget)
 */
async function detectBudgetOverruns(now: Date): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];
  
  // Check daily budget overruns for agents
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const agentBudgetStats = await db
    .select({
      agentId: agents.id,
      agentName: agents.name,
      dailyBudgetUsd: agents.dailyBudgetUsd,
      dailySpent: sql`
        COALESCE(SUM(${costEntries.amount}), 0)
      `.as('dailySpent'),
    })
    .from(agents)
    .leftJoin(costEntries, 
      and(
        eq(costEntries.agentId, agents.id),
        gte(costEntries.createdAt, today),
        lte(costEntries.createdAt, tomorrow)
      )
    )
    .where(sql`${agents.dailyBudgetUsd} IS NOT NULL`)
    .groupBy(agents.id, agents.name, agents.dailyBudgetUsd);

  for (const stats of agentBudgetStats) {
    const dailyBudgetCents = Number(stats.dailyBudgetUsd || 0);
    const dailySpentCents = Number(stats.dailySpent || 0);
    
    if (dailyBudgetCents > 0 && dailySpentCents > dailyBudgetCents) {
      const overrunPercent = Math.round(((dailySpentCents / dailyBudgetCents) - 1) * 100);
      
      anomalies.push({
        id: `budget_overrun_${stats.agentId}`,
        type: 'budget_overrun',
        severity: overrunPercent > 50 ? 'critical' : 'warning',
        title: `Budget overrun for agent ${stats.agentName}`,
        description: `Agent has spent $${(dailySpentCents / 100).toFixed(2)} today, exceeding daily budget of $${(dailyBudgetCents / 100).toFixed(2)} by ${overrunPercent}%`,
        detected_at: now.toISOString(),
        affected_resources: {
          agents: [stats.agentId],
        },
        metrics: {
          budget_usd: dailyBudgetCents / 100,
          spent_usd: dailySpentCents / 100,
          overrun_percent: overrunPercent,
        },
        suggested_actions: [
          'Pause non-critical tasks for this agent',
          'Review recent high-cost operations',
          'Adjust daily budget if justified',
        ],
      });
    }
  }

  // TODO: Add project budget overruns when project budgets are implemented

  return anomalies;
}

/**
 * Detect stale tasks (in_progress for > 2x estimated_hours)
 */
async function detectStaleTasks(now: Date): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  const staleTasks = await db
    .select({
      id: tasks.id,
      title: tasks.title,
      estimatedHours: tasks.estimatedHours,
      assigneeName: agents.name,
      assigneeId: agents.id,
      startTime: sql`
        SELECT MIN(${taskExecutions.startedAt})
        FROM ${taskExecutions}
        WHERE ${taskExecutions.taskId} = ${tasks.id} 
        AND ${taskExecutions.status} = 'running'
      `.as('startTime'),
    })
    .from(tasks)
    .leftJoin(agents, eq(tasks.assigneeId, agents.id))
    .where(
      and(
        eq(tasks.status, 'in_progress'),
        sql`${tasks.estimatedHours} IS NOT NULL`
      )
    );

  for (const task of staleTasks) {
    if (!task.estimatedHours || !task.startTime) continue;
    
    const estimatedHours = Number(task.estimatedHours);
    const startTime = task.startTime as Date;
    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const thresholdHours = estimatedHours * 2;
    
    if (hoursElapsed > thresholdHours) {
      const delayRatio = Math.round(hoursElapsed / estimatedHours * 10) / 10;
      
      anomalies.push({
        id: `stale_task_${task.id}`,
        type: 'stale_tasks',
        severity: delayRatio > 4 ? 'critical' : 'warning',
        title: `Stale task detected: ${task.title}`,
        description: `Task has been in progress for ${Math.round(hoursElapsed)} hours, exceeding ${delayRatio}x the estimated ${estimatedHours} hours`,
        detected_at: now.toISOString(),
        affected_resources: {
          tasks: [task.id],
          agents: task.assigneeId ? [task.assigneeId] : undefined,
        },
        metrics: {
          estimated_hours: estimatedHours,
          actual_hours: Math.round(hoursElapsed * 10) / 10,
          delay_ratio: delayRatio,
        },
        suggested_actions: [
          'Check task complexity and scope',
          'Contact assigned agent for status update',
          'Consider breaking down into smaller tasks',
          'Reassign if agent is blocked',
        ],
      });
    }
  }

  return anomalies;
}