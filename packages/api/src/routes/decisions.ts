import { Hono } from 'hono';
import { eq, sql, and, desc, gte, lte, count } from 'drizzle-orm';
import { z } from 'zod';
import { 
  db, 
  decisions, 
  users,
  projects,
  tasks,
  type NewDecision 
} from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';

const app = new Hono();

// Validation schemas
const listDecisionsSchema = z.object({
  type: z.enum(['task_assign', 'deploy', 'escalate', 'approve', 'budget']).optional(),
  made_by: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  task_id: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

const resolveDecisionSchema = z.object({
  outcome: z.string().min(1),
  notes: z.string().optional(),
});

const statsSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  group_by: z.enum(['type', 'day', 'week', 'month']).optional().default('type'),
});

// GET /api/v2/decisions - List decisions
app.get('/', requireAuth, async (c) => {
  try {
    const params = {
      type: c.req.query('type'),
      made_by: c.req.query('made_by'),
      project_id: c.req.query('project_id'),
      task_id: c.req.query('task_id'),
      from: c.req.query('from'),
      to: c.req.query('to'),
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20,
      offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0,
    };

    const validatedParams = listDecisionsSchema.parse(params);

    // Build query conditions
    const conditions = [];
    
    if (validatedParams.type) {
      conditions.push(eq(decisions.decisionType, validatedParams.type));
    }
    if (validatedParams.made_by) {
      conditions.push(eq(decisions.madeBy, validatedParams.made_by));
    }
    if (validatedParams.project_id) {
      conditions.push(eq(decisions.projectId, validatedParams.project_id));
    }
    if (validatedParams.task_id) {
      conditions.push(eq(decisions.taskId, validatedParams.task_id));
    }
    if (validatedParams.from) {
      conditions.push(gte(decisions.createdAt, new Date(validatedParams.from)));
    }
    if (validatedParams.to) {
      conditions.push(lte(decisions.createdAt, new Date(validatedParams.to)));
    }

    // Get decisions with pagination
    const [decisionsList, totalResult] = await Promise.all([
      db
        .select({
          id: decisions.id,
          decisionType: decisions.decisionType,
          madeBy: decisions.madeBy,
          context: decisions.context,
          decision: decisions.decision,
          reasoning: decisions.reasoning,
          outcome: decisions.outcome,
          projectId: decisions.projectId,
          taskId: decisions.taskId,
          createdAt: decisions.createdAt,
          madeByName: users.displayName,
          projectName: projects.name,
          taskTitle: tasks.title,
        })
        .from(decisions)
        .leftJoin(users, eq(decisions.madeBy, users.id))
        .leftJoin(projects, eq(decisions.projectId, projects.id))
        .leftJoin(tasks, eq(decisions.taskId, tasks.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(decisions.createdAt))
        .limit(validatedParams.limit)
        .offset(validatedParams.offset),
      db
        .select({ count: count() })
        .from(decisions)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / validatedParams.limit);

    return c.json({
      data: decisionsList,
      pagination: {
        offset: validatedParams.offset,
        limit: validatedParams.limit,
        total,
        totalPages,
        hasNext: validatedParams.offset + validatedParams.limit < total,
        hasPrev: validatedParams.offset > 0,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error fetching decisions:', error);
    return c.json({ error: 'Failed to fetch decisions' }, 500);
  }
});

// GET /api/v2/decisions/pending - Decisions awaiting human resolution
app.get('/pending', requireAuth, async (c) => {
  try {
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = parseInt(c.req.query('offset') || '0', 10);

    // Get pending decisions (where outcome IS NULL)
    const [pendingDecisions, totalResult] = await Promise.all([
      db
        .select({
          id: decisions.id,
          decisionType: decisions.decisionType,
          madeBy: decisions.madeBy,
          context: decisions.context,
          decision: decisions.decision,
          reasoning: decisions.reasoning,
          projectId: decisions.projectId,
          taskId: decisions.taskId,
          createdAt: decisions.createdAt,
          madeByName: users.displayName,
          projectName: projects.name,
          taskTitle: tasks.title,
        })
        .from(decisions)
        .leftJoin(users, eq(decisions.madeBy, users.id))
        .leftJoin(projects, eq(decisions.projectId, projects.id))
        .leftJoin(tasks, eq(decisions.taskId, tasks.id))
        .where(sql`${decisions.outcome} IS NULL`)
        .orderBy(desc(decisions.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: count() })
        .from(decisions)
        .where(sql`${decisions.outcome} IS NULL`)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      data: pendingDecisions,
      pagination: {
        offset,
        limit,
        total,
        totalPages,
        hasNext: offset + limit < total,
        hasPrev: offset > 0,
      },
    });
  } catch (error) {
    console.error('Error fetching pending decisions:', error);
    return c.json({ error: 'Failed to fetch pending decisions' }, 500);
  }
});

// POST /api/v2/decisions/:id/resolve - Resolve a decision (admin+)
app.post('/:id/resolve', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    if (!id) {
      return c.json({ error: 'Decision ID is required' }, 400);
    }

    const validatedData = resolveDecisionSchema.parse(body);

    // Check if decision exists and is pending
    const [existingDecision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, id))
      .limit(1);

    if (!existingDecision) {
      return c.json({ error: 'Decision not found' }, 404);
    }

    if (existingDecision.outcome !== null) {
      return c.json({ 
        error: 'Decision has already been resolved',
        outcome: existingDecision.outcome 
      }, 400);
    }

    // Resolve the decision
    const updateData = {
      outcome: validatedData.outcome,
      // Store resolution notes in the outcome field or add a notes column if needed
      // For now, append notes to outcome
      ...(validatedData.notes && {
        outcome: `${validatedData.outcome}\n\nNotes: ${validatedData.notes}`
      }),
    };

    const [resolvedDecision] = await db
      .update(decisions)
      .set(updateData)
      .where(eq(decisions.id, id))
      .returning();

    return c.json({ data: resolvedDecision });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }

    console.error('Error resolving decision:', error);
    return c.json({ error: 'Failed to resolve decision' }, 500);
  }
});

// GET /api/v2/decisions/stats - Decision statistics
app.get('/stats', requireAuth, async (c) => {
  try {
    const params = {
      from: c.req.query('from'),
      to: c.req.query('to'),
      group_by: c.req.query('group_by') || 'type',
    };

    const validatedParams = statsSchema.parse(params);

    // Build date filter conditions
    const conditions = [];
    if (validatedParams.from) {
      conditions.push(gte(decisions.createdAt, new Date(validatedParams.from)));
    }
    if (validatedParams.to) {
      conditions.push(lte(decisions.createdAt, new Date(validatedParams.to)));
    }

    let groupByClause: any;
    let selectClause: any;

    switch (validatedParams.group_by) {
      case 'type':
        groupByClause = [decisions.decisionType];
        selectClause = {
          group_key: decisions.decisionType,
          group_name: decisions.decisionType,
          total_count: count(decisions.id),
          pending_count: count(sql`CASE WHEN ${decisions.outcome} IS NULL THEN 1 END`),
          resolved_count: count(sql`CASE WHEN ${decisions.outcome} IS NOT NULL THEN 1 END`),
        };
        break;
      case 'day':
        groupByClause = [sql`DATE(${decisions.createdAt})`];
        selectClause = {
          group_key: sql`DATE(${decisions.createdAt})`,
          group_name: sql`DATE(${decisions.createdAt})`,
          total_count: count(decisions.id),
          pending_count: count(sql`CASE WHEN ${decisions.outcome} IS NULL THEN 1 END`),
          resolved_count: count(sql`CASE WHEN ${decisions.outcome} IS NOT NULL THEN 1 END`),
        };
        break;
      case 'week':
        groupByClause = [sql`DATE_TRUNC('week', ${decisions.createdAt})`];
        selectClause = {
          group_key: sql`DATE_TRUNC('week', ${decisions.createdAt})`,
          group_name: sql`DATE_TRUNC('week', ${decisions.createdAt})`,
          total_count: count(decisions.id),
          pending_count: count(sql`CASE WHEN ${decisions.outcome} IS NULL THEN 1 END`),
          resolved_count: count(sql`CASE WHEN ${decisions.outcome} IS NOT NULL THEN 1 END`),
        };
        break;
      case 'month':
        groupByClause = [sql`DATE_TRUNC('month', ${decisions.createdAt})`];
        selectClause = {
          group_key: sql`DATE_TRUNC('month', ${decisions.createdAt})`,
          group_name: sql`DATE_TRUNC('month', ${decisions.createdAt})`,
          total_count: count(decisions.id),
          pending_count: count(sql`CASE WHEN ${decisions.outcome} IS NULL THEN 1 END`),
          resolved_count: count(sql`CASE WHEN ${decisions.outcome} IS NOT NULL THEN 1 END`),
        };
        break;
      default:
        return c.json({ error: 'Invalid group_by parameter' }, 400);
    }

    let query = db.select(selectClause).from(decisions);

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const stats = await query
      .groupBy(...groupByClause)
      .orderBy(sql`group_key DESC`);

    // Calculate resolution percentages
    const statsWithPercentages = stats.map(stat => ({
      ...stat,
      resolution_percentage: Number(stat.total_count) > 0 ? 
        Math.round((Number(stat.resolved_count) / Number(stat.total_count)) * 100) : 0,
    }));

    // Overall summary
    const [overallStats] = await db
      .select({
        totalDecisions: count(decisions.id),
        pendingDecisions: count(sql`CASE WHEN ${decisions.outcome} IS NULL THEN 1 END`),
        resolvedDecisions: count(sql`CASE WHEN ${decisions.outcome} IS NOT NULL THEN 1 END`),
      })
      .from(decisions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalDecisions = Number(overallStats.totalDecisions);
    const pendingDecisions = Number(overallStats.pendingDecisions);
    const resolvedDecisions = Number(overallStats.resolvedDecisions);

    return c.json({
      data: {
        overview: {
          total_decisions: totalDecisions,
          pending_decisions: pendingDecisions,
          resolved_decisions: resolvedDecisions,
          resolution_percentage: totalDecisions > 0 ? 
            Math.round((resolvedDecisions / totalDecisions) * 100) : 0,
        },
        breakdown: statsWithPercentages,
        group_by: validatedParams.group_by,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error fetching decision stats:', error);
    return c.json({ error: 'Failed to fetch decision stats' }, 500);
  }
});

export default app;