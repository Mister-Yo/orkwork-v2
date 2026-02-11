import { Hono } from 'hono';
import { eq, sql, and, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';
import { db, auditLog } from '../db';
import { requireRole, getAuthUser } from '../auth/middleware';

const app = new Hono();

// GET /api/v2/audit - List audit entries (owner/admin)
app.get('/', requireRole('admin'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 200);
    const offset = (page - 1) * limit;

    const actorId = c.req.query('actor_id');
    const resourceType = c.req.query('resource_type');
    const action = c.req.query('action');
    const from = c.req.query('from'); // ISO date string
    const to = c.req.query('to'); // ISO date string

    // Build query conditions
    const conditions = [];
    
    if (actorId) {
      conditions.push(eq(auditLog.actorId, actorId));
    }
    
    if (resourceType) {
      conditions.push(eq(auditLog.resourceType, resourceType));
    }
    
    if (action) {
      conditions.push(eq(auditLog.action, action));
    }
    
    if (from) {
      try {
        const fromDate = new Date(from);
        conditions.push(gte(auditLog.createdAt, fromDate));
      } catch (error) {
        return c.json({ error: 'Invalid from date format' }, 400);
      }
    }
    
    if (to) {
      try {
        const toDate = new Date(to);
        conditions.push(lte(auditLog.createdAt, toDate));
      } catch (error) {
        return c.json({ error: 'Invalid to date format' }, 400);
      }
    }

    // Get audit entries with pagination
    const [auditEntries, totalResult] = await Promise.all([
      db
        .select()
        .from(auditLog)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .orderBy(desc(auditLog.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(auditLog)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      entries: auditEntries,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      filters: {
        actorId,
        resourceType,
        action,
        from,
        to,
      },
    });
  } catch (error) {
    console.error('Error fetching audit entries:', error);
    return c.json({ error: 'Failed to fetch audit entries' }, 500);
  }
});

// GET /api/v2/audit/stats - Get audit statistics (admin+)
app.get('/stats', requireRole('admin'), async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '7', 10);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    // Get stats by action
    const actionStats = await db
      .select({
        action: auditLog.action,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, fromDate))
      .groupBy(auditLog.action)
      .orderBy(desc(sql`count(*)`));

    // Get stats by actor type
    const actorTypeStats = await db
      .select({
        actorType: auditLog.actorType,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, fromDate))
      .groupBy(auditLog.actorType)
      .orderBy(desc(sql`count(*)`));

    // Get stats by resource type
    const resourceTypeStats = await db
      .select({
        resourceType: auditLog.resourceType,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, fromDate))
      .groupBy(auditLog.resourceType)
      .orderBy(desc(sql`count(*)`));

    // Get total activity
    const [totalActivity] = await db
      .select({
        total: sql<number>`count(*)`.as('total'),
      })
      .from(auditLog)
      .where(gte(auditLog.createdAt, fromDate));

    return c.json({
      period: {
        days,
        from: fromDate.toISOString(),
        to: new Date().toISOString(),
      },
      totalActivity: Number(totalActivity.total),
      byAction: actionStats.map(stat => ({
        action: stat.action,
        count: Number(stat.count),
      })),
      byActorType: actorTypeStats.map(stat => ({
        actorType: stat.actorType,
        count: Number(stat.count),
      })),
      byResourceType: resourceTypeStats.map(stat => ({
        resourceType: stat.resourceType,
        count: Number(stat.count),
      })),
    });
  } catch (error) {
    console.error('Error fetching audit stats:', error);
    return c.json({ error: 'Failed to fetch audit statistics' }, 500);
  }
});

export default app;