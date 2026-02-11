import { Hono } from 'hono';
import { eq, sql, and, desc, count } from 'drizzle-orm';
import { z } from 'zod';
import { db, projects, tasks, costEntries, type Project, type NewProject } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';

const app = new Hono();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.string().max(50).optional().default('active'),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional().default('normal'),
  budget: z.number().int().min(0).optional(), // in cents
  budgetUsd: z.number().int().min(0).optional(), // in cents
  deadline: z.string().datetime().optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional().default('low'),
});

const updateProjectSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.string().max(50).optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  budget: z.number().int().min(0).optional(),
  budgetUsd: z.number().int().min(0).optional(),
  deadline: z.string().datetime().optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).optional(),
});

// GET /api/v2/projects - List projects
app.get('/', requireAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const status = c.req.query('status');
    const priority = c.req.query('priority');
    const search = c.req.query('search');

    // Build query conditions
    const conditions = [];
    if (status) {
      conditions.push(eq(projects.status, status));
    }
    if (priority) {
      conditions.push(eq(projects.priority, priority as any));
    }
    if (search) {
      conditions.push(
        sql`(${projects.name} ILIKE ${`%${search}%`} OR ${projects.description} ILIKE ${`%${search}%`})`
      );
    }

    // Get projects with task count and budget info
    const [projectsList, totalResult] = await Promise.all([
      db
        .select({
          id: projects.id,
          name: projects.name,
          description: projects.description,
          status: projects.status,
          priority: projects.priority,
          budget: projects.budget,
          spentBudget: projects.spentBudget,
          budgetUsd: projects.budgetUsd,
          spentUsd: projects.spentUsd,
          deadline: projects.deadline,
          healthScore: projects.healthScore,
          riskLevel: projects.riskLevel,
          createdAt: projects.createdAt,
          updatedAt: projects.updatedAt,
          taskCount: count(tasks.id).as('taskCount'),
        })
        .from(projects)
        .leftJoin(tasks, eq(tasks.projectId, projects.id))
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .groupBy(projects.id)
        .orderBy(desc(projects.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(projects)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      projects: projectsList,
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
    console.error('Error fetching projects:', error);
    return c.json({ error: 'Failed to fetch projects' }, 500);
  }
});

// POST /api/v2/projects - Create new project (admin+)
app.post('/', requireRole('admin'), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createProjectSchema.parse(body);

    const newProject: NewProject = {
      ...validatedData,
      deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
      spentBudget: 0,
      spentUsd: 0,
    };

    const [createdProject] = await db.insert(projects).values(newProject).returning();

    return c.json({ project: createdProject }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating project:', error);
    return c.json({ error: 'Failed to create project' }, 500);
  }
});

// GET /api/v2/projects/:id - Get specific project
app.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const [project] = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        budget: projects.budget,
        spentBudget: projects.spentBudget,
        budgetUsd: projects.budgetUsd,
        spentUsd: projects.spentUsd,
        deadline: projects.deadline,
        healthScore: projects.healthScore,
        riskLevel: projects.riskLevel,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        taskCount: count(tasks.id).as('taskCount'),
      })
      .from(projects)
      .leftJoin(tasks, eq(tasks.projectId, projects.id))
      .where(eq(projects.id, id))
      .groupBy(projects.id)
      .limit(1);

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return c.json({ error: 'Failed to fetch project' }, 500);
  }
});

// PATCH /api/v2/projects/:id - Update project
app.patch('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const validatedData = updateProjectSchema.parse(body);

    // Check if project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (existingProject.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Update project
    const updateData = {
      ...validatedData,
      deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined,
      updatedAt: new Date(),
    };

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(eq(projects.id, id))
      .returning();

    return c.json({ project: updatedProject });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error updating project:', error);
    return c.json({ error: 'Failed to update project' }, 500);
  }
});

// DELETE /api/v2/projects/:id - Delete project (owner only)
app.delete('/:id', requireRole('owner'), async (c) => {
  try {
    const id = c.req.param('id');

    if (!id) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    // Check if project exists
    const existingProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (existingProject.length === 0) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Delete project (cascade will handle related records)
    await db.delete(projects).where(eq(projects.id, id));

    return c.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return c.json({ error: 'Failed to delete project' }, 500);
  }
});

// GET /api/v2/projects/:id/tasks - Get tasks for project
app.get('/:id/tasks', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (!id) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    const status = c.req.query('status');
    const priority = c.req.query('priority');
    const assignee = c.req.query('assignee');

    // Build query conditions
    const conditions = [eq(tasks.projectId, id)];
    if (status) {
      conditions.push(eq(tasks.status, status as any));
    }
    if (priority) {
      conditions.push(eq(tasks.priority, priority as any));
    }
    if (assignee) {
      conditions.push(eq(tasks.assigneeId, assignee));
    }

    const [tasksList, totalResult] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
        .orderBy(desc(tasks.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(tasks)
        .where(sql`${sql.join(conditions, sql` AND `)}`)
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
    console.error('Error fetching project tasks:', error);
    return c.json({ error: 'Failed to fetch project tasks' }, 500);
  }
});

// GET /api/v2/projects/:id/costs - Get cost entries for project
app.get('/:id/costs', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    if (!id) {
      return c.json({ error: 'Project ID is required' }, 400);
    }

    // Get cost entries for tasks in this project
    const [costsList, totalResult] = await Promise.all([
      db
        .select()
        .from(costEntries)
        .innerJoin(tasks, eq(costEntries.taskId, tasks.id))
        .where(eq(tasks.projectId, id))
        .orderBy(desc(costEntries.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(costEntries)
        .innerJoin(tasks, eq(costEntries.taskId, tasks.id))
        .where(eq(tasks.projectId, id))
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      costs: costsList,
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
    console.error('Error fetching project costs:', error);
    return c.json({ error: 'Failed to fetch project costs' }, 500);
  }
});

export default app;