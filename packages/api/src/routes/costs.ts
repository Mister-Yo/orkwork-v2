import { Hono } from 'hono';
import { eq, sql, and, desc, gte, lte, count } from 'drizzle-orm';
import { z } from 'zod';
import { 
  db, 
  costEntries, 
  agents, 
  tasks, 
  projects, 
  type NewCostEntry 
} from '../db';
import { requireAuth, requireScope } from '../auth/middleware';
import { updateAgentSpent } from '../engine/costs';

const app = new Hono();

// Validation schemas
const createCostSchema = z.object({
  agent_id: z.string().uuid(),
  task_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  cost_type: z.enum(['api_tokens', 'compute', 'storage']),
  amount_usd: z.number().min(0), // in USD (float)
  tokens_input: z.number().int().min(0).optional(),
  tokens_output: z.number().int().min(0).optional(),
  model: z.string().min(1).optional(),
  description: z.string().optional(),
});

const listCostsSchema = z.object({
  agent_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  cost_type: z.enum(['api_tokens', 'compute', 'storage']).optional(),
  model: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

const summarySchema = z.object({
  group_by: z.enum(['agent', 'project', 'model', 'day', 'week', 'month']),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const forecastSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// POST /api/v2/costs - Record cost entry (agents with costs:write scope)
app.post('/', requireScope('costs:write'), async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = createCostSchema.parse(body);

    // Check that agent exists
    const [agent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, validatedData.agent_id))
      .limit(1);

    if (!agent) {
      return c.json({ error: 'Agent not found' }, 404);
    }

    // Check task exists if provided
    if (validatedData.task_id) {
      const [task] = await db
        .select()
        .from(tasks)
        .where(eq(tasks.id, validatedData.task_id))
        .limit(1);

      if (!task) {
        return c.json({ error: 'Task not found' }, 404);
      }
    }

    // Check project exists if provided
    if (validatedData.project_id) {
      const [project] = await db
        .select()
        .from(projects)
        .where(eq(projects.id, validatedData.project_id))
        .limit(1);

      if (!project) {
        return c.json({ error: 'Project not found' }, 404);
      }
    }

    // Convert USD to cents for storage
    const amountCents = Math.round(validatedData.amount_usd * 100);

    const newCostEntry: NewCostEntry = {
      agentId: validatedData.agent_id,
      taskId: validatedData.task_id,
      costType: validatedData.cost_type,
      amount: amountCents,
      tokenCount: (validatedData.tokens_input || 0) + (validatedData.tokens_output || 0),
      model: validatedData.model,
      metadata: {
        tokens_input: validatedData.tokens_input,
        tokens_output: validatedData.tokens_output,
        description: validatedData.description,
        project_id: validatedData.project_id,
      },
    };

    const [createdCost] = await db
      .insert(costEntries)
      .values(newCostEntry)
      .returning();

    // Update agent spent amount
    await updateAgentSpent(validatedData.agent_id, validatedData.amount_usd);

    // Return cost with amount in USD
    return c.json({
      data: {
        ...createdCost,
        amount_usd: createdCost.amount / 100,
      },
    }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error creating cost entry:', error);
    return c.json({ error: 'Failed to create cost entry' }, 500);
  }
});

// GET /api/v2/costs - List costs
app.get('/', requireAuth, async (c) => {
  try {
    const params = {
      agent_id: c.req.query('agent_id'),
      project_id: c.req.query('project_id'),
      cost_type: c.req.query('cost_type'),
      model: c.req.query('model'),
      from: c.req.query('from'),
      to: c.req.query('to'),
      limit: c.req.query('limit') ? parseInt(c.req.query('limit')!) : 20,
      offset: c.req.query('offset') ? parseInt(c.req.query('offset')!) : 0,
    };

    const validatedParams = listCostsSchema.parse(params);

    // Build query conditions
    const conditions = [];
    
    if (validatedParams.agent_id) {
      conditions.push(eq(costEntries.agentId, validatedParams.agent_id));
    }
    if (validatedParams.project_id) {
      conditions.push(sql`${costEntries.metadata}->>'project_id' = ${validatedParams.project_id}`);
    }
    if (validatedParams.cost_type) {
      conditions.push(eq(costEntries.costType, validatedParams.cost_type));
    }
    if (validatedParams.model) {
      conditions.push(eq(costEntries.model, validatedParams.model));
    }
    if (validatedParams.from) {
      conditions.push(gte(costEntries.createdAt, new Date(validatedParams.from)));
    }
    if (validatedParams.to) {
      conditions.push(lte(costEntries.createdAt, new Date(validatedParams.to)));
    }

    // Get costs with pagination
    const [costsList, totalResult] = await Promise.all([
      db
        .select({
          id: costEntries.id,
          agentId: costEntries.agentId,
          taskId: costEntries.taskId,
          costType: costEntries.costType,
          amount: costEntries.amount,
          tokenCount: costEntries.tokenCount,
          model: costEntries.model,
          metadata: costEntries.metadata,
          createdAt: costEntries.createdAt,
          agentName: agents.name,
        })
        .from(costEntries)
        .leftJoin(agents, eq(costEntries.agentId, agents.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(costEntries.createdAt))
        .limit(validatedParams.limit)
        .offset(validatedParams.offset),
      db
        .select({ count: count() })
        .from(costEntries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / validatedParams.limit);

    // Convert amounts to USD
    const costsWithUsd = costsList.map(cost => ({
      ...cost,
      amount_usd: cost.amount / 100,
    }));

    return c.json({
      data: costsWithUsd,
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
    
    console.error('Error fetching costs:', error);
    return c.json({ error: 'Failed to fetch costs' }, 500);
  }
});

// GET /api/v2/costs/summary - Aggregated breakdown
app.get('/summary', requireAuth, async (c) => {
  try {
    const params = {
      group_by: c.req.query('group_by'),
      from: c.req.query('from'),
      to: c.req.query('to'),
    };

    const validatedParams = summarySchema.parse(params);

    // Build date filter conditions
    const conditions = [];
    if (validatedParams.from) {
      conditions.push(gte(costEntries.createdAt, new Date(validatedParams.from)));
    }
    if (validatedParams.to) {
      conditions.push(lte(costEntries.createdAt, new Date(validatedParams.to)));
    }

    let groupByClause: any;
    let selectClause: any;

    switch (validatedParams.group_by) {
      case 'agent':
        groupByClause = [costEntries.agentId, agents.name];
        selectClause = {
          group_key: costEntries.agentId,
          group_name: agents.name,
          total_amount: sql`SUM(${costEntries.amount})`.as('total_amount'),
          total_tokens: sql`SUM(${costEntries.tokenCount})`.as('total_tokens'),
          entry_count: count(costEntries.id),
        };
        break;
      case 'project':
        groupByClause = [sql`${costEntries.metadata}->>'project_id'`];
        selectClause = {
          group_key: sql`${costEntries.metadata}->>'project_id'`,
          group_name: sql`COALESCE(${projects.name}, 'No Project')`,
          total_amount: sql`SUM(${costEntries.amount})`.as('total_amount'),
          total_tokens: sql`SUM(${costEntries.tokenCount})`.as('total_tokens'),
          entry_count: count(costEntries.id),
        };
        break;
      case 'model':
        groupByClause = [costEntries.model];
        selectClause = {
          group_key: costEntries.model,
          group_name: sql`COALESCE(${costEntries.model}, 'Unknown Model')`,
          total_amount: sql`SUM(${costEntries.amount})`.as('total_amount'),
          total_tokens: sql`SUM(${costEntries.tokenCount})`.as('total_tokens'),
          entry_count: count(costEntries.id),
        };
        break;
      case 'day':
        groupByClause = [sql`DATE(${costEntries.createdAt})`];
        selectClause = {
          group_key: sql`DATE(${costEntries.createdAt})`,
          group_name: sql`DATE(${costEntries.createdAt})`,
          total_amount: sql`SUM(${costEntries.amount})`.as('total_amount'),
          total_tokens: sql`SUM(${costEntries.tokenCount})`.as('total_tokens'),
          entry_count: count(costEntries.id),
        };
        break;
      case 'week':
        groupByClause = [sql`DATE_TRUNC('week', ${costEntries.createdAt})`];
        selectClause = {
          group_key: sql`DATE_TRUNC('week', ${costEntries.createdAt})`,
          group_name: sql`DATE_TRUNC('week', ${costEntries.createdAt})`,
          total_amount: sql`SUM(${costEntries.amount})`.as('total_amount'),
          total_tokens: sql`SUM(${costEntries.tokenCount})`.as('total_tokens'),
          entry_count: count(costEntries.id),
        };
        break;
      case 'month':
        groupByClause = [sql`DATE_TRUNC('month', ${costEntries.createdAt})`];
        selectClause = {
          group_key: sql`DATE_TRUNC('month', ${costEntries.createdAt})`,
          group_name: sql`DATE_TRUNC('month', ${costEntries.createdAt})`,
          total_amount: sql`SUM(${costEntries.amount})`.as('total_amount'),
          total_tokens: sql`SUM(${costEntries.tokenCount})`.as('total_tokens'),
          entry_count: count(costEntries.id),
        };
        break;
      default:
        return c.json({ error: 'Invalid group_by parameter' }, 400);
    }

    let query = db
      .select(selectClause)
      .from(costEntries);

    if (validatedParams.group_by === 'agent') {
      query = query.leftJoin(agents, eq(costEntries.agentId, agents.id));
    } else if (validatedParams.group_by === 'project') {
      query = query.leftJoin(projects, sql`${projects.id} = ${costEntries.metadata}->>'project_id'`);
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const summary = await query
      .groupBy(...groupByClause)
      .orderBy(sql`total_amount DESC`);

    // Convert amounts to USD
    const summaryWithUsd = summary.map(item => ({
      ...item,
      total_amount_usd: Number(item.total_amount) / 100,
    }));

    return c.json({
      data: summaryWithUsd,
      group_by: validatedParams.group_by,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error fetching cost summary:', error);
    return c.json({ error: 'Failed to fetch cost summary' }, 500);
  }
});

// GET /api/v2/costs/forecast - Simple linear projection
app.get('/forecast', requireAuth, async (c) => {
  try {
    const params = {
      from: c.req.query('from'),
      to: c.req.query('to'),
    };

    const validatedParams = forecastSchema.parse(params);

    // Default to last 30 days for burn rate calculation
    const defaultFrom = new Date();
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    
    const fromDate = validatedParams.from ? new Date(validatedParams.from) : defaultFrom;
    const toDate = validatedParams.to ? new Date(validatedParams.to) : new Date();

    // Calculate current burn rate (total cost over the period)
    const [burnRateResult] = await db
      .select({
        totalCost: sql`SUM(${costEntries.amount})`.as('totalCost'),
        dayCount: sql`COUNT(DISTINCT DATE(${costEntries.createdAt}))`.as('dayCount'),
      })
      .from(costEntries)
      .where(
        and(
          gte(costEntries.createdAt, fromDate),
          lte(costEntries.createdAt, toDate)
        )
      );

    const totalCostCents = Number(burnRateResult.totalCost || 0);
    const dayCount = Number(burnRateResult.dayCount || 1);
    const dailyBurnRateUsd = (totalCostCents / 100) / dayCount;

    // Project monthly cost (30 days)
    const monthlyForecastUsd = dailyBurnRateUsd * 30;

    // Get current month-to-date spending
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [monthToDateResult] = await db
      .select({
        monthToDateCost: sql`SUM(${costEntries.amount})`.as('monthToDateCost'),
      })
      .from(costEntries)
      .where(gte(costEntries.createdAt, startOfMonth));

    const monthToDateUsd = Number(monthToDateResult.monthToDateCost || 0) / 100;

    return c.json({
      data: {
        period: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
          days: dayCount,
        },
        burn_rate: {
          daily_usd: Math.round(dailyBurnRateUsd * 100) / 100,
          monthly_forecast_usd: Math.round(monthlyForecastUsd * 100) / 100,
        },
        current_month: {
          month_to_date_usd: Math.round(monthToDateUsd * 100) / 100,
          projected_month_end_usd: Math.round((monthToDateUsd + (dailyBurnRateUsd * (30 - new Date().getDate()))) * 100) / 100,
        },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        issues: error.issues,
      }, 400);
    }
    
    console.error('Error generating cost forecast:', error);
    return c.json({ error: 'Failed to generate cost forecast' }, 500);
  }
});

export default app;