import { Hono } from 'hono';
import { eq, sql, and, desc, count, inArray } from 'drizzle-orm';
import { z } from 'zod';
import { db, tasks, taskDependencies, taskExecutions, users, type Task, type NewTask, type NewTaskDependency } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';

const app = new Hono();

// Valid status transitions
const statusTransitions: Record<string, string[]> = {
  created: ['planning', 'ready', 'cancelled'],
  planning: ['ready', 'cancelled'],
  ready: ['assigned', 'cancelled'],
  assigned: ['in_progress', 'blocked', 'cancelled'],
  in_progress: ['review', 'blocked', 'completed', 'cancelled'],
  review: ['completed', 'rejected'],
  rejected: ['assigned', 'in_progress'],
  blocked: ['ready', 'assigned', 'cancelled'],
};

// Validation schemas
const createTaskSchema = z.object({
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional().default('normal'),
  estimatedHours: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  acceptanceCriteria: z.string().optional(),
  reviewRequired: z.boolean().optional().default(false),
  autoAssigned: z.boolean().optional().default(false),
  maxRetries: z.number().int().min(0).optional().default(3),
});

const updateTaskSchema = z.object({
  projectId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  estimatedHours: z.number().int().min(0).optional(),
  actualHours: z.number().int().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  acceptanceCriteria: z.string().optional(),
  reviewRequired: z.boolean().optional(),
  autoAssigned: z.boolean().optional(),
  maxRetries: z.number().int().min(0).optional(),
});

const createDependencySchema = z.object({
  dependsOnTaskId: z.string().uuid(),
  type: z.enum(['blocks', 'soft', 'related']).default('blocks'),
});

const statusUpdateSchema = z.object({
  status: z.enum(['created', 'planning', 'ready', 'assigned', 'in_progress', 'review', 'completed', 'blocked', 'cancelled', 'rejected']),
});

// GET /api/v2/tasks - List tasks
app.get('/', requireAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const status = c.req.query('status');
    const priority = c.req.query('priority');
    const assigneeId = c.req.query('assignee_id');
    const projectId = c.req.query('project_id');
    const search = c.req.query('search');

    // Build query conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(tasks.status, status as any));
    }
    if (priority) {
      conditions.push(eq(tasks.priority, priority as any));
    }
    if (assigneeId) {
      conditions.push(eq(tasks.assigneeId, assigneeId));
    }
    if (projectId) {
      conditions.push(eq(tasks.projectId, projectId));
    }
    if (search) {
      conditions.push(
        sql`(${tasks.title} ILIKE ${`%${search}%`} OR ${tasks.description} ILIKE ${`%${search}%`})`
      );
    }

    // Get tasks with pagination
    const [tasksList, totalResult] = await Promise.all([
      db
        .select({
          id: tasks.id,
          projectId: tasks.projectId,
          assigneeId: tasks.assigneeId,
          title: tasks.title,
          description: tasks.description,
          status: tasks.status,
          priority: tasks.priority,
          estimatedHours: tasks.estimatedHours,
          actualHours: tasks.actualHours,
          dueDate: tasks.dueDate,
          completedAt: tasks.completedAt,
          acceptanceCriteria: tasks.acceptanceCriteria,
          reviewRequired: tasks.reviewRequired,
          autoAssigned: tasks.autoAssigned,
          retryCount: tasks.retryCount,
          maxRetries: tasks.maxRetries,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,
          assigneeName: users.displayName,
        })
        .from(tasks)
        .leftJoin(users, eq(tasks.assigneeId, users.id))
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .orderBy(desc(tasks.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(tasks)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      tasks: tasksList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// POST /api/v2/tasks - Create new task (member+)
app.post('/', requireRole('member'), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createTaskSchema.parse(body);

    const newTask: NewTask = {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      status: 'created',
      retryCount: 0,
    };

    const [createdTask] = await db.insert(tasks).values(newTask).returning();

    return c.json({ task: createdTask }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating task:', error);
    return c.json({ error: 'Failed to create task' }, 500);
  }
});

// GET /api/v2/tasks/:id - Get specific task with dependencies and executions
app.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    // Get task with assignee
    const [task] = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        assigneeId: tasks.assigneeId,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        estimatedHours: tasks.estimatedHours,
        actualHours: tasks.actualHours,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        acceptanceCriteria: tasks.acceptanceCriteria,
        reviewRequired: tasks.reviewRequired,
        autoAssigned: tasks.autoAssigned,
        retryCount: tasks.retryCount,
        maxRetries: tasks.maxRetries,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        assigneeName: users.displayName,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.assigneeId, users.id))
      .where(eq(tasks.id, id))
      .limit(1);

    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Get dependencies
    const dependencies = await db
      .select({
        id: taskDependencies.id,
        dependsOnTaskId: taskDependencies.dependsOnTaskId,
        type: taskDependencies.dependencyType,
        dependsOnTaskTitle: sql<string>`t.title`.as('dependsOnTaskTitle'),
        dependsOnTaskStatus: sql<string>`t.status`.as('dependsOnTaskStatus'),
      })
      .from(taskDependencies)
      .innerJoin(sql`tasks t`, sql`t.id = ${taskDependencies.dependsOnTaskId}`)
      .where(eq(taskDependencies.taskId, id));

    // Get executions
    const executions = await db
      .select()
      .from(taskExecutions)
      .where(eq(taskExecutions.taskId, id))
      .orderBy(desc(taskExecutions.startedAt))
      .limit(10);

    return c.json({
      task: {
        ...task,
        dependencies,
        executions,
      },
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return c.json({ error: 'Failed to fetch task' }, 500);
  }
});

// PATCH /api/v2/tasks/:id - Update task
app.patch('/:id', requireRole('member'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    const validatedData = updateTaskSchema.parse(body);

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (existingTask.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Update task
    const updateData = {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      updatedAt: new Date(),
    };

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    return c.json({ task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating task:', error);
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// DELETE /api/v2/tasks/:id - Delete task (admin+)
app.delete('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    // Check if task exists
    const existingTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (existingTask.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }

    // Delete task (cascade will handle related records)
    await db.delete(tasks).where(eq(tasks.id, id));

    return c.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return c.json({ error: 'Failed to delete task' }, 500);
  }
});

// POST /api/v2/tasks/:id/dependencies - Add dependency
app.post('/:id/dependencies', requireRole('member'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();

    if (!id) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    const validatedData = createDependencySchema.parse(body);

    // Check if both tasks exist
    const [task, dependsOnTask] = await Promise.all([
      db.select().from(tasks).where(eq(tasks.id, id)).limit(1),
      db.select().from(tasks).where(eq(tasks.id, validatedData.dependsOnTaskId)).limit(1),
    ]);

    if (task.length === 0) {
      return c.json({ error: 'Task not found' }, 404);
    }
    if (dependsOnTask.length === 0) {
      return c.json({ error: 'Dependency task not found' }, 404);
    }

    // Check for circular dependency (simple check - could be more sophisticated)
    if (id === validatedData.dependsOnTaskId) {
      return c.json({ error: 'Task cannot depend on itself' }, 400);
    }

    // Check if dependency already exists
    const existingDependency = await db
      .select()
      .from(taskDependencies)
      .where(
        and(
          eq(taskDependencies.taskId, id),
          eq(taskDependencies.dependsOnTaskId, validatedData.dependsOnTaskId)
        )
      )
      .limit(1);

    if (existingDependency.length > 0) {
      return c.json({ error: 'Dependency already exists' }, 400);
    }

    // Create dependency
    const newDependency: NewTaskDependency = {
      taskId: id,
      dependsOnTaskId: validatedData.dependsOnTaskId,
      dependencyType: validatedData.type,
    };

    const [createdDependency] = await db
      .insert(taskDependencies)
      .values(newDependency)
      .returning();

    return c.json({ dependency: createdDependency }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating dependency:', error);
    return c.json({ error: 'Failed to create dependency' }, 500);
  }
});

// DELETE /api/v2/tasks/:id/dependencies/:depId - Remove dependency
app.delete('/:id/dependencies/:depId', requireRole('member'), async (c) => {
  try {
    const id = c.req.param('id');
    const depId = c.req.param('depId');

    if (!id || !depId) {
      return c.json({ error: 'Task ID and dependency ID are required' }, 400);
    }

    // Check if dependency exists and belongs to this task
    const existingDependency = await db
      .select()
      .from(taskDependencies)
      .where(
        and(
          eq(taskDependencies.id, depId),
          eq(taskDependencies.taskId, id)
        )
      )
      .limit(1);

    if (existingDependency.length === 0) {
      return c.json({ error: 'Dependency not found' }, 404);
    }

    // Delete dependency
    await db.delete(taskDependencies).where(eq(taskDependencies.id, depId));

    return c.json({ message: 'Dependency removed successfully' });
  } catch (error) {
    console.error('Error removing dependency:', error);
    return c.json({ error: 'Failed to remove dependency' }, 500);
  }
});

// GET /api/v2/tasks/graph - Return all tasks as nodes + dependency edges
app.get('/graph', requireAuth, async (c) => {
  try {
    const projectId = c.req.query('project_id');
    
    // Build conditions
    const conditions = [];
    if (projectId) {
      conditions.push(eq(tasks.projectId, projectId));
    }

    // Get all tasks
    const tasksList = await db
      .select({
        id: tasks.id,
        projectId: tasks.projectId,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        assigneeId: tasks.assigneeId,
      })
      .from(tasks)
      .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined);

    // Get all dependencies
    let dependenciesList = await db
      .select({
        from: taskDependencies.taskId,
        to: taskDependencies.dependsOnTaskId,
        type: taskDependencies.dependencyType,
      })
      .from(taskDependencies);

    // Filter dependencies if project filter is applied
    if (projectId) {
      const taskIds = tasksList.map(t => t.id);
      dependenciesList = dependenciesList.filter(
        dep => taskIds.includes(dep.from) && taskIds.includes(dep.to)
      );
    }

    return c.json({
      nodes: tasksList,
      edges: dependenciesList,
    });
  } catch (error) {
    console.error('Error fetching task graph:', error);
    return c.json({ error: 'Failed to fetch task graph' }, 500);
  }
});

// PATCH /api/v2/tasks/:id/status - Change status with transition validation
app.patch('/:id/status', requireRole('member'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Task ID is required' }, 400);
    }

    const validatedData = statusUpdateSchema.parse(body);
    const newStatus = validatedData.status;

    // Get current task
    const [currentTask] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (!currentTask) {
      return c.json({ error: 'Task not found' }, 404);
    }

    const currentStatus = currentTask.status;

    // Validate status transition
    const allowedTransitions = statusTransitions[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return c.json({
        error: 'Invalid status transition',
        current: currentStatus,
        requested: newStatus,
        allowed: allowedTransitions,
      }, 400);
    }

    // Check blocking dependencies for certain transitions
    if (['assigned', 'in_progress'].includes(newStatus)) {
      const blockingDeps = await db
        .select({
          dependsOnTaskId: taskDependencies.dependsOnTaskId,
          dependsOnTaskStatus: sql<string>`t.status`,
          dependsOnTaskTitle: sql<string>`t.title`,
        })
        .from(taskDependencies)
        .innerJoin(sql`tasks t`, sql`t.id = ${taskDependencies.dependsOnTaskId}`)
        .where(
          and(
            eq(taskDependencies.taskId, id),
            eq(taskDependencies.dependencyType, 'blocks'),
            sql`t.status != 'completed'`
          )
        );

      if (blockingDeps.length > 0) {
        return c.json({
          error: 'Cannot transition: blocking dependencies not completed',
          blockingDependencies: blockingDeps,
        }, 400);
      }
    }

    // Update task status
    const updateData: any = {
      status: newStatus,
      updatedAt: new Date(),
    };

    // Set completion time if completed
    if (newStatus === 'completed') {
      updateData.completedAt = new Date();
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();

    return c.json({ task: updatedTask });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating task status:', error);
    return c.json({ error: 'Failed to update task status' }, 500);
  }
});

export default app;