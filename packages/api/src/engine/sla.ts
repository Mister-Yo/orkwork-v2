import { eq, and, sql, lt } from 'drizzle-orm';
import { 
  db, 
  tasks, 
  taskExecutions,
  slaRules,
  notifications,
  type Task, 
  type SlaRule,
  type NewNotification,
} from '../db';

export interface SlaViolation {
  taskId: string;
  task: Task;
  slaRule: SlaRule;
  violationType: 'response' | 'resolution';
  expectedMinutes: number;
  actualMinutes: number;
  overdueLy: number;
}

export interface SlaCheckResult {
  totalTasks: number;
  violations: SlaViolation[];
  notificationsCreated: number;
}

/**
 * Check all active tasks against SLA rules and create notifications for violations
 */
export async function checkSLAs(): Promise<SlaCheckResult> {
  try {
    // Get all active SLA rules
    const activeSlaRules = await db
      .select()
      .from(slaRules)
      .where(eq(slaRules.isActive, true));

    if (activeSlaRules.length === 0) {
      return {
        totalTasks: 0,
        violations: [],
        notificationsCreated: 0,
      };
    }

    // Get all tasks that are not completed/cancelled
    const activeTasks = await db
      .select()
      .from(tasks)
      .where(sql`${tasks.status} NOT IN ('completed', 'cancelled', 'rejected')`);

    const violations: SlaViolation[] = [];
    
    for (const task of activeTasks) {
      for (const slaRule of activeSlaRules) {
        // Check if this SLA rule applies to this task
        if (doesSlaRuleApplyToTask(slaRule, task)) {
          const violation = await checkTaskAgainstSla(task, slaRule);
          if (violation) {
            violations.push(violation);
          }
        }
      }
    }

    // Create notifications for violations
    const notificationsCreated = await createViolationNotifications(violations);

    return {
      totalTasks: activeTasks.length,
      violations,
      notificationsCreated,
    };
  } catch (error) {
    console.error('SLA check error:', error);
    throw error;
  }
}

/**
 * Check if an SLA rule applies to a specific task
 */
function doesSlaRuleApplyToTask(slaRule: SlaRule, task: Task): boolean {
  switch (slaRule.targetType) {
    case 'all_tasks':
      return true;
    
    case 'priority':
      return task.priority === slaRule.targetValue;
    
    case 'project':
      return task.projectId === slaRule.targetValue;
    
    case 'status':
      return task.status === slaRule.targetValue;
      
    default:
      return false;
  }
}

/**
 * Check a specific task against a specific SLA rule
 */
async function checkTaskAgainstSla(task: Task, slaRule: SlaRule): Promise<SlaViolation | null> {
  const now = new Date();
  const createdAt = new Date(task.createdAt);
  
  // Calculate minutes since task creation
  const minutesSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));

  // Check response time violation (time from creation to first execution)
  const responseViolation = await checkResponseTimeViolation(
    task, 
    slaRule, 
    minutesSinceCreation
  );
  
  if (responseViolation) {
    return responseViolation;
  }

  // Check resolution time violation (time from creation to completion)
  const resolutionViolation = await checkResolutionTimeViolation(
    task, 
    slaRule, 
    minutesSinceCreation
  );
  
  return resolutionViolation;
}

/**
 * Check for response time violations
 */
async function checkResponseTimeViolation(
  task: Task, 
  slaRule: SlaRule, 
  minutesSinceCreation: number
): Promise<SlaViolation | null> {
  // Skip if task is already in progress or completed
  if (['in_progress', 'review', 'completed'].includes(task.status)) {
    return null;
  }

  // Check if task has any executions (response)
  const [firstExecution] = await db
    .select()
    .from(taskExecutions)
    .where(eq(taskExecutions.taskId, task.id))
    .orderBy(taskExecutions.startedAt)
    .limit(1);

  // If no executions and we're past response time limit
  if (!firstExecution && minutesSinceCreation > slaRule.maxResponseMinutes) {
    return {
      taskId: task.id,
      task,
      slaRule,
      violationType: 'response',
      expectedMinutes: slaRule.maxResponseMinutes,
      actualMinutes: minutesSinceCreation,
      overdueLy: minutesSinceCreation - slaRule.maxResponseMinutes,
    };
  }

  return null;
}

/**
 * Check for resolution time violations
 */
async function checkResolutionTimeViolation(
  task: Task, 
  slaRule: SlaRule, 
  minutesSinceCreation: number
): Promise<SlaViolation | null> {
  // Skip if task is already completed
  if (['completed'].includes(task.status)) {
    return null;
  }

  // Check if we're past resolution time limit
  if (minutesSinceCreation > slaRule.maxResolutionMinutes) {
    return {
      taskId: task.id,
      task,
      slaRule,
      violationType: 'resolution',
      expectedMinutes: slaRule.maxResolutionMinutes,
      actualMinutes: minutesSinceCreation,
      overdueLy: minutesSinceCreation - slaRule.maxResolutionMinutes,
    };
  }

  return null;
}

/**
 * Create notifications for SLA violations based on escalation chains
 */
async function createViolationNotifications(violations: SlaViolation[]): Promise<number> {
  let notificationsCreated = 0;

  for (const violation of violations) {
    try {
      // Check if we've already notified about this violation recently
      const recentNotification = await db
        .select()
        .from(notifications)
        .where(and(
          sql`${notifications.metadata}->>'taskId' = ${violation.taskId}`,
          sql`${notifications.metadata}->>'violationType' = ${violation.violationType}`,
          sql`${notifications.createdAt} > NOW() - INTERVAL '1 hour'`
        ))
        .limit(1);

      if (recentNotification.length > 0) {
        continue; // Skip if we already notified about this violation in the last hour
      }

      // Create notifications based on escalation chain
      const escalationChain = violation.slaRule.escalationChain || {};
      const recipients = getEscalationRecipients(escalationChain, violation);

      for (const recipient of recipients) {
        const notification: NewNotification = {
          recipientType: recipient.type,
          recipientId: recipient.id,
          channel: recipient.channel || 'web',
          priority: getViolationPriority(violation),
          title: `SLA Violation: ${violation.violationType} time exceeded`,
          body: createViolationMessage(violation),
          metadata: {
            taskId: violation.taskId,
            slaRuleId: violation.slaRule.id,
            violationType: violation.violationType,
            overdueBy: violation.overdueLy,
            expectedMinutes: violation.expectedMinutes,
            actualMinutes: violation.actualMinutes,
          },
        };

        await db.insert(notifications).values(notification);
        notificationsCreated++;
      }
    } catch (error) {
      console.error(`Failed to create notification for violation ${violation.taskId}:`, error);
    }
  }

  return notificationsCreated;
}

/**
 * Get recipients from escalation chain
 */
function getEscalationRecipients(
  escalationChain: Record<string, any>, 
  violation: SlaViolation
): Array<{ type: 'user' | 'agent'; id: string; channel?: string }> {
  const recipients: Array<{ type: 'user' | 'agent'; id: string; channel?: string }> = [];
  
  // Default recipients if no escalation chain
  if (!escalationChain || Object.keys(escalationChain).length === 0) {
    // Notify system admin by default
    recipients.push({
      type: 'user',
      id: '00000000-0000-0000-0000-000000000000', // System user
      channel: 'web',
    });
    return recipients;
  }

  // Process escalation levels based on how overdue the task is
  const overdueHours = Math.floor(violation.overdueLy / 60);
  
  // Level 1: Just overdue (0-1 hours)
  if (escalationChain.level1 && overdueHours < 1) {
    recipients.push(...parseEscalationLevel(escalationChain.level1));
  }
  
  // Level 2: Moderately overdue (1-4 hours)
  if (escalationChain.level2 && overdueHours >= 1 && overdueHours < 4) {
    recipients.push(...parseEscalationLevel(escalationChain.level2));
  }
  
  // Level 3: Severely overdue (4+ hours)
  if (escalationChain.level3 && overdueHours >= 4) {
    recipients.push(...parseEscalationLevel(escalationChain.level3));
  }

  // If no specific level matched, use level1 as fallback
  if (recipients.length === 0 && escalationChain.level1) {
    recipients.push(...parseEscalationLevel(escalationChain.level1));
  }

  return recipients;
}

/**
 * Parse an escalation level configuration
 */
function parseEscalationLevel(
  level: any
): Array<{ type: 'user' | 'agent'; id: string; channel?: string }> {
  const recipients: Array<{ type: 'user' | 'agent'; id: string; channel?: string }> = [];
  
  if (Array.isArray(level)) {
    for (const recipient of level) {
      if (typeof recipient === 'string') {
        // Simple user ID
        recipients.push({ type: 'user', id: recipient });
      } else if (recipient.type && recipient.id) {
        // Full recipient object
        recipients.push({
          type: recipient.type,
          id: recipient.id,
          channel: recipient.channel as 'web' | 'email' | 'telegram' | 'slack' | undefined,
        });
      }
    }
  } else if (typeof level === 'string') {
    // Single user ID
    recipients.push({ type: 'user', id: level });
  }

  return recipients;
}

/**
 * Determine notification priority based on violation severity
 */
function getViolationPriority(violation: SlaViolation): 'urgent' | 'high' | 'normal' | 'low' {
  const overdueHours = violation.overdueLy / 60;
  
  if (overdueHours >= 8) return 'urgent';
  if (overdueHours >= 4) return 'high';
  if (overdueHours >= 1) return 'normal';
  
  return 'low';
}

/**
 * Create a human-readable message for the violation
 */
function createViolationMessage(violation: SlaViolation): string {
  const overdueHours = Math.floor(violation.overdueLy / 60);
  const overdueMinutes = violation.overdueLy % 60;
  
  let overdueText = '';
  if (overdueHours > 0) {
    overdueText = `${overdueHours}h ${overdueMinutes}m`;
  } else {
    overdueText = `${overdueMinutes}m`;
  }

  const expectedHours = Math.floor(violation.expectedMinutes / 60);
  const expectedMinutesRem = violation.expectedMinutes % 60;
  
  let expectedText = '';
  if (expectedHours > 0) {
    expectedText = `${expectedHours}h ${expectedMinutesRem}m`;
  } else {
    expectedText = `${expectedMinutesRem}m`;
  }

  if (violation.violationType === 'response') {
    return `Task "${violation.task.title}" has not been started within the required ${expectedText} response time. ` +
           `It is now overdue by ${overdueText}.`;
  } else {
    return `Task "${violation.task.title}" has not been completed within the required ${expectedText} resolution time. ` +
           `It is now overdue by ${overdueText}.`;
  }
}

/**
 * Get current SLA violations without creating new notifications
 */
export async function getCurrentSlaViolations(): Promise<SlaViolation[]> {
  try {
    // Get all active SLA rules
    const activeSlaRules = await db
      .select()
      .from(slaRules)
      .where(eq(slaRules.isActive, true));

    if (activeSlaRules.length === 0) {
      return [];
    }

    // Get all active tasks
    const activeTasks = await db
      .select()
      .from(tasks)
      .where(sql`${tasks.status} NOT IN ('completed', 'cancelled', 'rejected')`);

    const violations: SlaViolation[] = [];
    
    for (const task of activeTasks) {
      for (const slaRule of activeSlaRules) {
        if (doesSlaRuleApplyToTask(slaRule, task)) {
          const violation = await checkTaskAgainstSla(task, slaRule);
          if (violation) {
            violations.push(violation);
          }
        }
      }
    }

    return violations;
  } catch (error) {
    console.error('Error getting SLA violations:', error);
    throw error;
  }
}