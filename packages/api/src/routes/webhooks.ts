import { Hono } from 'hono';
import { z } from 'zod';
import { eq, desc, and, count } from 'drizzle-orm';
import { createHash, randomBytes } from 'crypto';
import { db, webhooks, webhookLogs, type NewWebhook } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';
import { validateEventTypes, sendTestWebhook } from '../engine/webhooks';

const app = new Hono();

// Validation schemas
const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  description: z.string().optional(),
});

const updateWebhookSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

const webhookQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

const logsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
  success: z.coerce.boolean().optional(),
});

// GET /api/v2/webhooks - List webhooks (admin+)
app.get('/', requireAuth, requireRole('admin'), async (c) => {
  try {
    // Parse and validate query parameters
    const queryResult = webhookQuerySchema.safeParse({
      limit: c.req.query('limit'),
      offset: c.req.query('offset'),
    });

    if (!queryResult.success) {
      return c.json({
        error: 'Invalid query parameters',
        details: queryResult.error.errors,
      }, 400);
    }

    const { limit, offset } = queryResult.data;

    // Get webhooks with recent logs count
    const webhookList = await db
      .select({
        webhook: webhooks,
        recentLogsCount: count(webhookLogs.id),
      })
      .from(webhooks)
      .leftJoin(webhookLogs, eq(webhooks.id, webhookLogs.webhookId))
      .groupBy(webhooks.id)
      .orderBy(desc(webhooks.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      webhooks: webhookList.map(item => ({
        ...item.webhook,
        recentLogsCount: item.recentLogsCount,
      })),
      pagination: {
        limit,
        offset,
        hasMore: webhookList.length === limit,
      },
    });
  } catch (error) {
    console.error('[Webhooks] Error listing webhooks:', error);
    return c.json({ error: 'Failed to list webhooks' }, 500);
  }
});

// POST /api/v2/webhooks - Create webhook (admin+)
app.post('/', requireAuth, requireRole('admin'), async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const body = await c.req.json();
    const validationResult = createWebhookSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json({
        error: 'Invalid webhook data',
        details: validationResult.error.errors,
      }, 400);
    }

    const { url, events, description } = validationResult.data;

    // Validate event types
    if (!validateEventTypes(events)) {
      return c.json({ error: 'Invalid event types' }, 400);
    }

    // Generate secret for HMAC
    const secret = randomBytes(32).toString('hex');

    const newWebhook: NewWebhook = {
      url,
      events,
      secret,
      createdBy: user.id,
      description,
      isActive: true,
    };

    const [webhook] = await db
      .insert(webhooks)
      .values(newWebhook)
      .returning();

    // Return webhook without secret for security
    const { secret: _, ...safeWebhook } = webhook;

    console.log(`[Webhooks] Created webhook ${webhook.id} for ${url}`);

    return c.json({
      message: 'Webhook created successfully',
      webhook: safeWebhook,
    }, 201);
  } catch (error) {
    console.error('[Webhooks] Error creating webhook:', error);
    return c.json({ error: 'Failed to create webhook' }, 500);
  }
});

// GET /api/v2/webhooks/:id - Get webhook with recent logs
app.get('/:id', requireAuth, requireRole('admin'), async (c) => {
  try {
    const webhookId = c.req.param('id');
    if (!webhookId) {
      return c.json({ error: 'Webhook ID is required' }, 400);
    }

    // Get webhook
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (!webhook) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    // Get recent logs (last 10)
    const recentLogs = await db
      .select()
      .from(webhookLogs)
      .where(eq(webhookLogs.webhookId, webhookId))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(10);

    // Remove secret for security
    const { secret: _, ...safeWebhook } = webhook;

    return c.json({
      webhook: safeWebhook,
      recentLogs,
    });
  } catch (error) {
    console.error('[Webhooks] Error getting webhook:', error);
    return c.json({ error: 'Failed to get webhook' }, 500);
  }
});

// PATCH /api/v2/webhooks/:id - Update webhook
app.patch('/:id', requireAuth, requireRole('admin'), async (c) => {
  try {
    const webhookId = c.req.param('id');
    if (!webhookId) {
      return c.json({ error: 'Webhook ID is required' }, 400);
    }

    const body = await c.req.json();
    const validationResult = updateWebhookSchema.safeParse(body);

    if (!validationResult.success) {
      return c.json({
        error: 'Invalid webhook data',
        details: validationResult.error.errors,
      }, 400);
    }

    const { url, events, description, isActive } = validationResult.data;

    // Validate event types if provided
    if (events && !validateEventTypes(events)) {
      return c.json({ error: 'Invalid event types' }, 400);
    }

    // Build update object
    const updateData: any = {};
    if (url !== undefined) updateData.url = url;
    if (events !== undefined) updateData.events = events;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'No fields to update' }, 400);
    }

    const [updatedWebhook] = await db
      .update(webhooks)
      .set(updateData)
      .where(eq(webhooks.id, webhookId))
      .returning();

    if (!updatedWebhook) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    // Remove secret for security
    const { secret: _, ...safeWebhook } = updatedWebhook;

    console.log(`[Webhooks] Updated webhook ${webhookId}`);

    return c.json({
      message: 'Webhook updated successfully',
      webhook: safeWebhook,
    });
  } catch (error) {
    console.error('[Webhooks] Error updating webhook:', error);
    return c.json({ error: 'Failed to update webhook' }, 500);
  }
});

// DELETE /api/v2/webhooks/:id - Delete webhook
app.delete('/:id', requireAuth, requireRole('admin'), async (c) => {
  try {
    const webhookId = c.req.param('id');
    if (!webhookId) {
      return c.json({ error: 'Webhook ID is required' }, 400);
    }

    const [deletedWebhook] = await db
      .delete(webhooks)
      .where(eq(webhooks.id, webhookId))
      .returning();

    if (!deletedWebhook) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    console.log(`[Webhooks] Deleted webhook ${webhookId}`);

    return c.json({
      message: 'Webhook deleted successfully',
      id: webhookId,
    });
  } catch (error) {
    console.error('[Webhooks] Error deleting webhook:', error);
    return c.json({ error: 'Failed to delete webhook' }, 500);
  }
});

// GET /api/v2/webhooks/:id/logs - Get webhook delivery logs
app.get('/:id/logs', requireAuth, requireRole('admin'), async (c) => {
  try {
    const webhookId = c.req.param('id');
    if (!webhookId) {
      return c.json({ error: 'Webhook ID is required' }, 400);
    }

    // Parse and validate query parameters
    const queryResult = logsQuerySchema.safeParse({
      limit: c.req.query('limit'),
      offset: c.req.query('offset'),
      success: c.req.query('success'),
    });

    if (!queryResult.success) {
      return c.json({
        error: 'Invalid query parameters',
        details: queryResult.error.errors,
      }, 400);
    }

    const { limit, offset, success } = queryResult.data;

    // Check if webhook exists
    const [webhook] = await db
      .select({ id: webhooks.id })
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (!webhook) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    // Build conditions
    const conditions = [eq(webhookLogs.webhookId, webhookId)];
    if (success !== undefined) {
      conditions.push(eq(webhookLogs.success, success));
    }

    // Get logs
    const logs = await db
      .select()
      .from(webhookLogs)
      .where(and(...conditions))
      .orderBy(desc(webhookLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      logs,
      pagination: {
        limit,
        offset,
        hasMore: logs.length === limit,
      },
    });
  } catch (error) {
    console.error('[Webhooks] Error getting webhook logs:', error);
    return c.json({ error: 'Failed to get webhook logs' }, 500);
  }
});

// POST /api/v2/webhooks/:id/test - Send test webhook
app.post('/:id/test', requireAuth, requireRole('admin'), async (c) => {
  try {
    const webhookId = c.req.param('id');
    if (!webhookId) {
      return c.json({ error: 'Webhook ID is required' }, 400);
    }

    // Get webhook
    const [webhook] = await db
      .select()
      .from(webhooks)
      .where(eq(webhooks.id, webhookId));

    if (!webhook) {
      return c.json({ error: 'Webhook not found' }, 404);
    }

    // Send test webhook
    const result = await sendTestWebhook(webhook);

    console.log(`[Webhooks] Test webhook sent to ${webhook.url}, success: ${result.success}`);

    return c.json({
      message: 'Test webhook sent',
      result,
    });
  } catch (error) {
    console.error('[Webhooks] Error sending test webhook:', error);
    return c.json({ error: 'Failed to send test webhook' }, 500);
  }
});

export default app;