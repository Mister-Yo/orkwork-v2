import { Hono } from 'hono';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { z } from 'zod';
import { 
  db, 
  workflows,
  workflowRuns,
  users,
  type Workflow,
  type NewWorkflow,
  type WorkflowRun,
} from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';
import { executeWorkflow, calculateWorkflowProgress, validateWorkflowSteps } from '../engine/workflow';
import { logAuditEntry } from '../middleware/audit';
import { emitWorkflowStarted, emitWorkflowCompleted } from '../engine/events';

const app = new Hono();

// Validation schemas
const workflowStepSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().min(1).max(500),
  description: z.string().min(1),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional().default('normal'),
  required_capabilities: z.array(z.string()).optional().default([]),
  depends_on: z.array(z.string()).optional().default([]),
  review_required: z.boolean().optional().default(false),
  estimated_hours: z.number().int().min(0).optional(),
  acceptance_criteria: z.string().optional(),
});

const createWorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  steps: z.array(workflowStepSchema).min(1),
  triggerType: z.enum(['manual', 'schedule', 'event', 'webhook']).default('manual'),
  triggerConfig: z.record(z.any()).optional().default({}),
  isActive: z.boolean().optional().default(true),
});

const updateWorkflowSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  steps: z.array(workflowStepSchema).optional(),
  triggerType: z.enum(['manual', 'schedule', 'event', 'webhook']).optional(),
  triggerConfig: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
});

const executeWorkflowSchema = z.object({
  projectId: z.string().uuid(),
  variables: z.record(z.any()).optional().default({}),
});

// GET /api/v2/workflows - List workflows
app.get('/', requireAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const isActive = c.req.query('is_active');
    const triggerType = c.req.query('trigger_type');
    const createdBy = c.req.query('created_by');

    // Build query conditions
    const conditions = [];
    if (isActive !== undefined) {
      conditions.push(eq(workflows.isActive, isActive === 'true'));
    }
    if (triggerType) {
      conditions.push(eq(workflows.triggerType, triggerType as any));
    }
    if (createdBy) {
      conditions.push(eq(workflows.createdBy, createdBy));
    }

    // Get workflows with creator info and run counts
    const [workflowsList, totalResult] = await Promise.all([
      db
        .select({
          id: workflows.id,
          name: workflows.name,
          description: workflows.description,
          triggerType: workflows.triggerType,
          triggerConfig: workflows.triggerConfig,
          isActive: workflows.isActive,
          createdAt: workflows.createdAt,
          updatedAt: workflows.updatedAt,
          createdByName: users.displayName,
          stepCount: sql<number>`jsonb_array_length(${workflows.steps})`.as('stepCount'),
          runCount: count(workflowRuns.id).as('runCount'),
        })
        .from(workflows)
        .leftJoin(users, eq(workflows.createdBy, users.id))
        .leftJoin(workflowRuns, eq(workflowRuns.workflowId, workflows.id))
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .groupBy(workflows.id, users.displayName)
        .orderBy(desc(workflows.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(workflows)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      data: {
        workflows: workflowsList,
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
    console.error('Error fetching workflows:', error);
    return c.json({ error: 'Failed to fetch workflows' }, 500);
  }
});

// POST /api/v2/workflows - Create workflow (admin+)
app.post('/', requireRole('admin'), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createWorkflowSchema.parse(body);

    // Validate workflow steps structure
    const stepValidation = validateWorkflowSteps(validatedData.steps);
    if (!stepValidation.isValid) {
      return c.json({
        error: 'Invalid workflow steps',
        issues: stepValidation.errors,
      }, 400);
    }

    // Check for duplicate names
    const [existingWorkflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.name, validatedData.name))
      .limit(1);

    if (existingWorkflow) {
      return c.json({ 
        error: 'Workflow with this name already exists',
        name: validatedData.name,
      }, 409);
    }

    // Create workflow
    const newWorkflow: NewWorkflow = {
      ...validatedData,
      createdBy: getAuthUser(c).id,
    };

    const [createdWorkflow] = await db
      .insert(workflows)
      .values(newWorkflow)
      .returning();

    // Log the creation
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'create',
      resourceType: 'workflow',
      resourceId: createdWorkflow.id,
      details: {
        name: createdWorkflow.name,
        stepCount: validatedData.steps.length,
        triggerType: createdWorkflow.triggerType,
      },
    });

    return c.json({ data: createdWorkflow }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error creating workflow:', error);
    return c.json({ error: 'Failed to create workflow' }, 500);
  }
});

// GET /api/v2/workflows/:id - Get specific workflow with runs
app.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Workflow ID is required' }, 400);
    }

    // Get workflow with creator info
    const [workflowRecord] = await db
      .select({
        workflow: workflows,
        createdByName: users.displayName,
      })
      .from(workflows)
      .leftJoin(users, eq(workflows.createdBy, users.id))
      .where(eq(workflows.id, id))
      .limit(1);

    if (!workflowRecord) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    const workflow = workflowRecord.workflow;

    // Get recent runs
    const recentRuns = await db
      .select({
        id: workflowRuns.id,
        status: workflowRuns.status,
        startedAt: workflowRuns.startedAt,
        completedAt: workflowRuns.completedAt,
        results: workflowRuns.results,
      })
      .from(workflowRuns)
      .where(eq(workflowRuns.workflowId, id))
      .orderBy(desc(workflowRuns.startedAt))
      .limit(10);

    return c.json({
      data: {
        ...workflow,
        createdByName: workflowRecord.createdByName,
        recentRuns,
      }
    });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return c.json({ error: 'Failed to fetch workflow' }, 500);
  }
});

// PATCH /api/v2/workflows/:id - Update workflow (admin+)
app.patch('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!id) {
      return c.json({ error: 'Workflow ID is required' }, 400);
    }

    const validatedData = updateWorkflowSchema.parse(body);

    // Check if workflow exists
    const [existingWorkflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1);

    if (!existingWorkflow) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    // Validate workflow steps if provided
    if (validatedData.steps) {
      const stepValidation = validateWorkflowSteps(validatedData.steps);
      if (!stepValidation.isValid) {
        return c.json({
          error: 'Invalid workflow steps',
          issues: stepValidation.errors,
        }, 400);
      }
    }

    // Check for duplicate names if name is being changed
    if (validatedData.name && validatedData.name !== existingWorkflow.name) {
      const [duplicateWorkflow] = await db
        .select()
        .from(workflows)
        .where(eq(workflows.name, validatedData.name))
        .limit(1);

      if (duplicateWorkflow) {
        return c.json({ 
          error: 'Workflow with this name already exists',
          name: validatedData.name,
        }, 409);
      }
    }

    // Update workflow
    const updateData = {
      ...validatedData,
      updatedAt: new Date(),
    };

    const [updatedWorkflow] = await db
      .update(workflows)
      .set(updateData)
      .where(eq(workflows.id, id))
      .returning();

    // Log the update
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'update',
      resourceType: 'workflow',
      resourceId: id,
      details: {
        updatedFields: Object.keys(validatedData),
      },
    });

    return c.json({ data: updatedWorkflow });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating workflow:', error);
    return c.json({ error: 'Failed to update workflow' }, 500);
  }
});

// DELETE /api/v2/workflows/:id - Deactivate workflow (admin+)
app.delete('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Workflow ID is required' }, 400);
    }

    // Check if workflow exists
    const [existingWorkflow] = await db
      .select()
      .from(workflows)
      .where(eq(workflows.id, id))
      .limit(1);

    if (!existingWorkflow) {
      return c.json({ error: 'Workflow not found' }, 404);
    }

    // Soft delete by setting isActive to false
    const [deactivatedWorkflow] = await db
      .update(workflows)
      .set({ 
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(workflows.id, id))
      .returning();

    // Log the deactivation
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'deactivate',
      resourceType: 'workflow',
      resourceId: id,
      details: {
        name: existingWorkflow.name,
      },
    });

    return c.json({ 
      data: deactivatedWorkflow,
      message: 'Workflow deactivated successfully' 
    });
  } catch (error) {
    console.error('Error deactivating workflow:', error);
    return c.json({ error: 'Failed to deactivate workflow' }, 500);
  }
});

// POST /api/v2/workflows/:id/run - Execute workflow
app.post('/:id/run', requireRole('member'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!id) {
      return c.json({ error: 'Workflow ID is required' }, 400);
    }

    const validatedData = executeWorkflowSchema.parse(body);

    // Check if workflow exists and is active
    const [workflow] = await db
      .select()
      .from(workflows)
      .where(and(
        eq(workflows.id, id),
        eq(workflows.isActive, true)
      ))
      .limit(1);

    if (!workflow) {
      return c.json({ error: 'Workflow not found or inactive' }, 404);
    }

    // Execute the workflow
    const result = await executeWorkflow(id, validatedData.projectId, getAuthUser(c).id);

    // Log the execution
    await logAuditEntry({
      actorId: getAuthUser(c).id,
      actorType: 'user',
      action: 'execute',
      resourceType: 'workflow',
      resourceId: id,
      details: {
        projectId: validatedData.projectId,
        workflowRunId: result.workflowRun.id,
        tasksCreated: result.createdTasks.length,
        autoAssigned: result.autoAssignedTasks.length,
        errors: result.errors.length,
      },
    });

    return c.json({ 
      data: {
        workflowRun: result.workflowRun,
        createdTasks: result.createdTasks,
        autoAssignedTasks: result.autoAssignedTasks,
        errors: result.errors,
        summary: {
          tasksCreated: result.createdTasks.length,
          autoAssigned: result.autoAssignedTasks.length,
          errorsEncountered: result.errors.length,
        },
      }
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error executing workflow:', error);
    return c.json({ error: 'Failed to execute workflow' }, 500);
  }
});

// GET /api/v2/workflows/:id/runs - List workflow runs
app.get('/:id/runs', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (!id) {
      return c.json({ error: 'Workflow ID is required' }, 400);
    }

    const status = c.req.query('status');

    // Build conditions
    const conditions = [eq(workflowRuns.workflowId, id)];
    if (status) {
      conditions.push(eq(workflowRuns.status, status as any));
    }

    // Get workflow runs
    const [runs, totalResult] = await Promise.all([
      db
        .select()
        .from(workflowRuns)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(desc(workflowRuns.startedAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(workflowRuns)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    // Add progress info to each run
    const runsWithProgress = await Promise.all(
      runs.map(async (run) => {
        try {
          const progress = await calculateWorkflowProgress(run.id);
          return { ...run, progress };
        } catch (error) {
          console.error(`Failed to calculate progress for run ${run.id}:`, error);
          return { 
            ...run, 
            progress: { 
              totalTasks: 0, 
              completedTasks: 0, 
              inProgressTasks: 0,
              readyTasks: 0,
              blockedTasks: 0,
              percentage: 0 
            }
          };
        }
      })
    );

    return c.json({
      data: {
        runs: runsWithProgress,
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
    console.error('Error fetching workflow runs:', error);
    return c.json({ error: 'Failed to fetch workflow runs' }, 500);
  }
});

// GET /api/v2/workflows/:id/runs/:runId - Get workflow run details
app.get('/:id/runs/:runId', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const runId = c.req.param('runId');

    if (!id || !runId) {
      return c.json({ error: 'Workflow ID and run ID are required' }, 400);
    }

    // Get workflow run
    const [workflowRun] = await db
      .select()
      .from(workflowRuns)
      .where(and(
        eq(workflowRuns.id, runId),
        eq(workflowRuns.workflowId, id)
      ))
      .limit(1);

    if (!workflowRun) {
      return c.json({ error: 'Workflow run not found' }, 404);
    }

    // Calculate progress
    const progress = await calculateWorkflowProgress(runId);

    // Get task details if available
    const results = workflowRun.results as any;
    let taskDetails = [];
    
    if (results?.taskIds && Array.isArray(results.taskIds)) {
      // We'd need to implement a proper query for multiple task IDs
      // For now, we'll just include the IDs
      taskDetails = results.taskIds.map((taskId: string) => ({ taskId }));
    }

    return c.json({
      data: {
        ...workflowRun,
        progress,
        taskDetails,
      }
    });
  } catch (error) {
    console.error('Error fetching workflow run:', error);
    return c.json({ error: 'Failed to fetch workflow run' }, 500);
  }
});

export default app;