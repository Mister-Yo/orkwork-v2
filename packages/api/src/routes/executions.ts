import { Hono } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { 
  db, 
  tasks, 
  taskExecutions, 
  agents,
  type TaskExecution, 
  type NewTaskExecution,
  type Task,
} from '../db';
import { requireAuth, requireRole, getAuthAgent, getAuthContext } from '../auth/middleware';
import { requireScope } from '../auth/scopes';
import { logAuditEntry } from '../middleware/audit';

const app = new Hono();

// Validation schemas
const startExecutionSchema = z.object({
  agentId: z.string().uuid().optional(), // For user auth, required for agent auth
});

const updateExecutionSchema = z.object({
  output: z.string().optional(),
  error: z.string().optional(),
  tokensUsed: z.number().int().min(0).optional(),
  costUsd: z.number().int().min(0).optional(), // in cents
});

const completeExecutionSchema = z.object({
  status: z.enum(['success', 'failed', 'timeout']),
  output: z.string().optional(),
  error: z.string().optional(),
  tokensUsed: z.number().int().min(0).optional(),
  costUsd: z.number().int().min(0).optional(), // in cents
});

// POST /api/v2/tasks/:taskId/executions - Start execution
app.post('/:taskId/executions', requireAuth, async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const body = await c.req.json();

    if (!taskId) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    const validatedData = startExecutionSchema.parse(body);
    const { type, user, agent } = getAuthContext(c);

    let agentId: string;
    
    if (type === 'agent') {
      // Agent API key authentication
      if (!agent) {
        return c.json({ error: 'Agent authentication required' }, 401);
      }
      
      // Check scope
      const agentScopes = (c.get('agentScopes') as string[]) || [];
      if (!agentScopes.includes('tasks:write')) {
        return c.json({ 
          error: 'Insufficient permissions',
          required: 'tasks:write',
          available: agentScopes,
        }, 403);
      }
      
      agentId = agent.id;
    } else {
      // User authentication
      if (!validatedData.agentId) {
        return c.json({ error: 'Agent ID is required for user authentication' }, 400);
      }
      agentId = validatedData.agentId;
    }

    // Get the task
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Verify agent exists and is active
    const [agentRecord] = await db
      .select()
      .from(agents)
      .where(and(
        eq(agents.id, agentId),
        eq(agents.status, 'active')
      ))
      .limit(1);

    if (!agentRecord) {
      return c.json({ error: 'Agent not found or inactive' }, 404);
    }

    // Check if agent is assigned to task (for agent auth) or has general access (for user auth)
    if (type === 'agent') {
      // For agent auth, they must either be assigned or have task:assign scope
      const isAssigned = task.assigneeId === null; // We'll track assignment in executions
      const hasAssignScope = (c.get('agentScopes') as string[] || []).includes('tasks:assign');
      
      if (!isAssigned && !hasAssignScope) {
        return c.json({ 
          error: 'Agent not assigned to this task',
          taskId,
          agentId,
        }, 403);
      }
    }

    // Check if task is in a valid state for execution
    if (!['ready', 'assigned', 'in_progress'].includes(task.status)) {
      return c.json({ 
        error: 'Task is not in a valid state for execution',
        status: task.status,
        validStates: ['ready', 'assigned', 'in_progress'],
      }, 400);
    }

    // Check if there's already a running execution
    const [runningExecution] = await db
      .select()
      .from(taskExecutions)
      .where(and(
        eq(taskExecutions.taskId, taskId),
        eq(taskExecutions.status, 'running')
      ))
      .limit(1);

    if (runningExecution) {
      return c.json({ 
        error: 'Task already has a running execution',
        executionId: runningExecution.id,
      }, 409);
    }

    // Create execution record
    const newExecution: NewTaskExecution = {
      taskId,
      agentId,
      status: 'running',
      startedAt: new Date(),
    };

    const [createdExecution] = await db
      .insert(taskExecutions)
      .values(newExecution)
      .returning();

    // Update task status to in_progress if not already
    if (task.status !== 'in_progress') {
      await db
        .update(tasks)
        .set({
          status: 'in_progress',
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));
    }

    // Log the execution start
    await logAuditEntry({
      actorId: type === 'agent' ? agentId : user!.id,
      actorType: type === 'agent' ? 'agent' : 'user',
      action: 'start_execution',
      resourceType: 'task',
      resourceId: taskId,
      details: {
        executionId: createdExecution.id,
        agentId,
      },
    });

    return c.json({ data: createdExecution }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error starting execution:', error);
    return c.json({ error: 'Failed to start execution' }, 500);
  }
});

// PATCH /api/v2/tasks/:taskId/executions/:executionId - Update execution
app.patch('/:taskId/executions/:executionId', requireAuth, async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const executionId = c.req.param('executionId');
    const body = await c.req.json();

    if (!taskId || !executionId) {
      return c.json({ error: 'Task ID and execution ID are required' }, 400);
    }

    const validatedData = updateExecutionSchema.parse(body);
    const { type, user, agent } = getAuthContext(c);

    // Get the execution with task and agent info
    const [executionRecord] = await db
      .select({
        execution: taskExecutions,
        task: tasks,
        agent: agents,
      })
      .from(taskExecutions)
      .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
      .innerJoin(agents, eq(taskExecutions.agentId, agents.id))
      .where(and(
        eq(taskExecutions.id, executionId),
        eq(taskExecutions.taskId, taskId)
      ))
      .limit(1);

    if (!executionRecord) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    const execution = executionRecord.execution;
    const task = executionRecord.task;

    // Authorization check
    if (type === 'agent') {
      // Agent can only update their own executions
      if (execution.agentId !== agent!.id) {
        return c.json({ 
          error: 'Agents can only update their own executions',
          executionAgent: execution.agentId,
          currentAgent: agent!.id,
        }, 403);
      }
      
      // Check scope
      const agentScopes = (c.get('agentScopes') as string[]) || [];
      if (!agentScopes.includes('tasks:write')) {
        return c.json({ 
          error: 'Insufficient permissions',
          required: 'tasks:write',
        }, 403);
      }
    } else {
      // User auth - need member role
      if (!user) {
        return c.json({ error: 'User authentication required' }, 401);
      }
    }

    // Can only update running executions
    if (execution.status !== 'running') {
      return c.json({ 
        error: 'Can only update running executions',
        status: execution.status,
      }, 400);
    }

    // Update execution
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const [updatedExecution] = await db
      .update(taskExecutions)
      .set(updateData)
      .where(eq(taskExecutions.id, executionId))
      .returning();

    // Log the update
    await logAuditEntry({
      actorId: type === 'agent' ? agent!.id : user!.id,
      actorType: type === 'agent' ? 'agent' : 'user',
      action: 'update_execution',
      resourceType: 'task_execution',
      resourceId: executionId,
      details: {
        taskId,
        updates: Object.keys(validatedData),
      },
    });

    return c.json({ data: updatedExecution });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating execution:', error);
    return c.json({ error: 'Failed to update execution' }, 500);
  }
});

// POST /api/v2/tasks/:taskId/executions/:executionId/complete - Complete execution
app.post('/:taskId/executions/:executionId/complete', requireAuth, async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const executionId = c.req.param('executionId');
    const body = await c.req.json();

    if (!taskId || !executionId) {
      return c.json({ error: 'Task ID and execution ID are required' }, 400);
    }

    const validatedData = completeExecutionSchema.parse(body);
    const { type, user, agent } = getAuthContext(c);

    // Get the execution with task info
    const [executionRecord] = await db
      .select({
        execution: taskExecutions,
        task: tasks,
      })
      .from(taskExecutions)
      .innerJoin(tasks, eq(taskExecutions.taskId, tasks.id))
      .where(and(
        eq(taskExecutions.id, executionId),
        eq(taskExecutions.taskId, taskId)
      ))
      .limit(1);

    if (!executionRecord) {
      return c.json({ error: 'Execution not found' }, 404);
    }

    const execution = executionRecord.execution;
    const task = executionRecord.task;

    // Authorization check
    if (type === 'agent' && execution.agentId !== agent!.id) {
      return c.json({ 
        error: 'Agents can only complete their own executions',
      }, 403);
    }

    // Can only complete running executions
    if (execution.status !== 'running') {
      return c.json({ 
        error: 'Can only complete running executions',
        status: execution.status,
      }, 400);
    }

    // Calculate duration
    const startedAt = new Date(execution.startedAt);
    const completedAt = new Date();
    const durationMs = completedAt.getTime() - startedAt.getTime();

    // Update execution
    const [completedExecution] = await db
      .update(taskExecutions)
      .set({
        status: validatedData.status,
        completedAt,
        output: validatedData.output,
        error: validatedData.error,
        tokensUsed: validatedData.tokensUsed,
        costUsd: validatedData.costUsd,
        durationMs,
      })
      .where(eq(taskExecutions.id, executionId))
      .returning();

    // Handle task status transitions based on execution result
    let newTaskStatus = task.status;
    
    if (validatedData.status === 'success') {
      // On success: transition to review (if required) or completed
      newTaskStatus = task.reviewRequired ? 'review' : 'completed';
    } else if (validatedData.status === 'failed') {
      // On failure: increment retry count, retry if < max_retries, else block
      const newRetryCount = task.retryCount + 1;
      
      if (newRetryCount < task.maxRetries) {
        // Retry: keep status as assigned/ready for retry
        newTaskStatus = 'ready';
        await db
          .update(tasks)
          .set({
            retryCount: newRetryCount,
            status: newTaskStatus,
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, taskId));
      } else {
        // Max retries reached: block the task
        newTaskStatus = 'blocked';
        await db
          .update(tasks)
          .set({
            retryCount: newRetryCount,
            status: newTaskStatus,
            updatedAt: new Date(),
          })
          .where(eq(tasks.id, taskId));
      }
    } else if (validatedData.status === 'timeout') {
      // Timeout: similar to failure but might have different retry logic
      newTaskStatus = 'blocked';
      await db
        .update(tasks)
        .set({
          status: newTaskStatus,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));
    }

    // Update task status if needed (and not already handled above)
    if (validatedData.status === 'success') {
      await db
        .update(tasks)
        .set({
          status: newTaskStatus,
          ...(newTaskStatus === 'completed' ? { completedAt: completedAt } : {}),
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, taskId));
    }

    // Log the completion
    await logAuditEntry({
      actorId: type === 'agent' ? agent!.id : user!.id,
      actorType: type === 'agent' ? 'agent' : 'user',
      action: 'complete_execution',
      resourceType: 'task_execution',
      resourceId: executionId,
      details: {
        taskId,
        status: validatedData.status,
        durationMs,
        tokensUsed: validatedData.tokensUsed,
        costUsd: validatedData.costUsd,
        newTaskStatus,
      },
    });

    return c.json({ 
      data: {
        execution: completedExecution,
        taskStatus: newTaskStatus,
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error completing execution:', error);
    return c.json({ error: 'Failed to complete execution' }, 500);
  }
});

// GET /api/v2/tasks/:taskId/executions - List executions for task
app.get('/:taskId/executions', requireAuth, async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (!taskId) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    // Check if task exists
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Get executions with agent info
    const [executions, totalResult] = await Promise.all([
      db
        .select({
          id: taskExecutions.id,
          taskId: taskExecutions.taskId,
          agentId: taskExecutions.agentId,
          agentName: agents.name,
          startedAt: taskExecutions.startedAt,
          completedAt: taskExecutions.completedAt,
          status: taskExecutions.status,
          output: taskExecutions.output,
          error: taskExecutions.error,
          tokensUsed: taskExecutions.tokensUsed,
          costUsd: taskExecutions.costUsd,
          durationMs: taskExecutions.durationMs,
        })
        .from(taskExecutions)
        .innerJoin(agents, eq(taskExecutions.agentId, agents.id))
        .where(eq(taskExecutions.taskId, taskId))
        .orderBy(desc(taskExecutions.startedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(taskExecutions)
        .where(eq(taskExecutions.taskId, taskId))
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      data: {
        executions,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      }
    });
  } catch (error) {
    console.error('Error fetching executions:', error);
    return c.json({ error: 'Failed to fetch executions' }, 500);
  }
});

export default app;