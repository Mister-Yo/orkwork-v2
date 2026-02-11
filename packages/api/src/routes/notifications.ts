import { Hono } from 'hono';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db, notifications } from '../db';
import { requireAuth, getAuthUser } from '../auth/middleware';
import { requireScope } from '../auth/scopes';
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../engine/notifications';

const app = new Hono();

// Validation schemas
const notificationQuerySchema = z.object({
  status: z.enum(['pending', 'sent', 'read', 'failed']).optional(),
  channel: z.enum(['web', 'email', 'telegram', 'slack']).optional(),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

// GET /api/v2/notifications - List my notifications
app.get('/', requireAuth, requireScope('chat:read'), async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    // Parse and validate query parameters
    const queryResult = notificationQuerySchema.safeParse({
      status: c.req.query('status'),
      channel: c.req.query('channel'),
      priority: c.req.query('priority'),
      limit: c.req.query('limit'),
      offset: c.req.query('offset'),
    });

    if (!queryResult.success) {
      return c.json({
        error: 'Invalid query parameters',
        details: queryResult.error.errors,
      }, 400);
    }

    const { status, channel, priority, limit, offset } = queryResult.data;

    const notificationsList = await getUserNotifications(user.id, {
      status,
      channel,
      priority,
      limit,
      offset,
    });

    return c.json({
      notifications: notificationsList,
      pagination: {
        limit,
        offset,
        hasMore: notificationsList.length === limit,
      },
    });
  } catch (error) {
    console.error('[Notifications] Error listing notifications:', error);
    return c.json({ error: 'Failed to list notifications' }, 500);
  }
});

// GET /api/v2/notifications/unread-count - Get unread notification count
app.get('/unread-count', requireAuth, requireScope('chat:read'), async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const count = await getUnreadCount(user.id);

    return c.json({
      unreadCount: count,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Notifications] Error getting unread count:', error);
    return c.json({ error: 'Failed to get unread count' }, 500);
  }
});

// PATCH /api/v2/notifications/:id/read - Mark notification as read
app.patch('/:id/read', requireAuth, requireScope('chat:write'), async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const notificationId = c.req.param('id');
    if (!notificationId) {
      return c.json({ error: 'Notification ID is required' }, 400);
    }

    const notification = await markAsRead(notificationId, user.id);

    if (!notification) {
      return c.json({ error: 'Notification not found or unauthorized' }, 404);
    }

    return c.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('[Notifications] Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// PATCH /api/v2/notifications/read-all - Mark all notifications as read
app.patch('/read-all', requireAuth, requireScope('chat:write'), async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const updatedCount = await markAllAsRead(user.id);

    return c.json({
      message: `Marked ${updatedCount} notifications as read`,
      updatedCount,
    });
  } catch (error) {
    console.error('[Notifications] Error marking all notifications as read:', error);
    return c.json({ error: 'Failed to mark all notifications as read' }, 500);
  }
});

// DELETE /api/v2/notifications/:id - Delete notification
app.delete('/:id', requireAuth, requireScope('chat:write'), async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user || !user.id) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const notificationId = c.req.param('id');
    if (!notificationId) {
      return c.json({ error: 'Notification ID is required' }, 400);
    }

    // Delete notification (only if user owns it)
    const [deletedNotification] = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.recipientType, 'user'),
          eq(notifications.recipientId, user.id)
        )
      )
      .returning();

    if (!deletedNotification) {
      return c.json({ error: 'Notification not found or unauthorized' }, 404);
    }

    return c.json({
      message: 'Notification deleted',
      id: notificationId,
    });
  } catch (error) {
    console.error('[Notifications] Error deleting notification:', error);
    return c.json({ error: 'Failed to delete notification' }, 500);
  }
});

export default app;