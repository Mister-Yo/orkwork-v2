import { eq, and, or, count, desc } from 'drizzle-orm';
import { db, notifications, type NewNotification, type Notification } from '../db';
import { emitNotificationNew } from './events';

export interface CreateNotificationParams {
  recipientType: 'user' | 'agent';
  recipientId: string;
  channel: 'web' | 'email' | 'telegram' | 'slack';
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  body: string;
  metadata?: Record<string, any>;
}

export async function createNotification(params: CreateNotificationParams): Promise<Notification> {
  try {
    console.log(`[Notifications] Creating notification for ${params.recipientType}:${params.recipientId}`);

    const newNotification: NewNotification = {
      recipientType: params.recipientType,
      recipientId: params.recipientId,
      channel: params.channel,
      priority: params.priority || 'normal',
      title: params.title,
      body: params.body,
      metadata: params.metadata || {},
      status: 'pending',
    };

    const [notification] = await db
      .insert(notifications)
      .values(newNotification)
      .returning();

    emitNotificationNew(notification);

    console.log(`[Notifications] Created notification ${notification.id}`);
    return notification;
  } catch (error) {
    console.error('[Notifications] Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

export async function getUnreadCount(recipientId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.status, 'pending'),
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('[Notifications] Error getting unread count:', error);
    throw new Error('Failed to get unread count');
  }
}

export async function markAsRead(notificationId: string, recipientId?: string): Promise<Notification | null> {
  try {
    console.log(`[Notifications] Marking notification ${notificationId} as read`);

    const conditions = [eq(notifications.id, notificationId)];

    if (recipientId) {
      conditions.push(eq(notifications.recipientId, recipientId));
    }

    const [notification] = await db
      .update(notifications)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(and(...conditions))
      .returning();

    if (!notification) {
      console.log(`[Notifications] Notification ${notificationId} not found or unauthorized`);
      return null;
    }

    console.log(`[Notifications] Marked notification ${notificationId} as read`);
    return notification;
  } catch (error) {
    console.error('[Notifications] Error marking notification as read:', error);
    throw new Error('Failed to mark notification as read');
  }
}

export async function markAllAsRead(recipientId: string): Promise<number> {
  try {
    console.log(`[Notifications] Marking all notifications as read for ${recipientId}`);

    const result = await db
      .update(notifications)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.recipientId, recipientId),
          eq(notifications.status, 'pending')
        )
      )
      .returning();

    console.log(`[Notifications] Marked ${result.length} notifications as read`);
    return result.length;
  } catch (error) {
    console.error('[Notifications] Error marking all notifications as read:', error);
    throw new Error('Failed to mark all notifications as read');
  }
}

export async function getUserNotifications(
  recipientId: string,
  options: {
    status?: 'pending' | 'sent' | 'read' | 'failed';
    channel?: 'web' | 'email' | 'telegram' | 'slack';
    priority?: 'urgent' | 'high' | 'normal' | 'low';
    limit?: number;
    offset?: number;
  } = {}
): Promise<Notification[]> {
  try {
    const {
      status,
      channel,
      priority,
      limit = 20,
      offset = 0,
    } = options;

    const conditions = [
      eq(notifications.recipientId, recipientId),
    ];

    if (status) {
      conditions.push(eq(notifications.status, status));
    }
    if (channel) {
      conditions.push(eq(notifications.channel, channel));
    }
    if (priority) {
      conditions.push(eq(notifications.priority, priority));
    }

    const result = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(Math.min(limit, 100))
      .offset(offset);

    return result;
  } catch (error) {
    console.error('[Notifications] Error getting notifications:', error);
    throw new Error('Failed to get notifications');
  }
}
