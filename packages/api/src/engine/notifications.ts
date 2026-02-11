import { eq, and, count, desc } from 'drizzle-orm';
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

// Create a new notification in the database and emit SSE event
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

    // Emit real-time event
    emitNotificationNew(notification);

    console.log(`[Notifications] Created notification ${notification.id}`);
    return notification;
  } catch (error) {
    console.error('[Notifications] Error creating notification:', error);
    throw new Error('Failed to create notification');
  }
}

// Get unread notification count for a user
export async function getUnreadCount(userId: string): Promise<number> {
  try {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.recipientType, 'user'),
          eq(notifications.recipientId, userId),
          eq(notifications.status, 'pending'),
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error('[Notifications] Error getting unread count:', error);
    throw new Error('Failed to get unread count');
  }
}

// Mark notification as read
export async function markAsRead(notificationId: string, userId?: string): Promise<Notification | null> {
  try {
    console.log(`[Notifications] Marking notification ${notificationId} as read`);

    const conditions = [eq(notifications.id, notificationId)];
    
    // If userId is provided, ensure the user can only mark their own notifications
    if (userId) {
      conditions.push(
        and(
          eq(notifications.recipientType, 'user'),
          eq(notifications.recipientId, userId)
        )
      );
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

// Mark all notifications as read for a user
export async function markAllAsRead(userId: string): Promise<number> {
  try {
    console.log(`[Notifications] Marking all notifications as read for user ${userId}`);

    const result = await db
      .update(notifications)
      .set({
        status: 'read',
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.recipientType, 'user'),
          eq(notifications.recipientId, userId),
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

// Get notifications for a user (with pagination and filtering)
export async function getUserNotifications(
  userId: string,
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
      eq(notifications.recipientType, 'user'),
      eq(notifications.recipientId, userId),
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
      .limit(Math.min(limit, 100)) // Cap at 100
      .offset(offset);

    return result;
  } catch (error) {
    console.error('[Notifications] Error getting user notifications:', error);
    throw new Error('Failed to get notifications');
  }
}