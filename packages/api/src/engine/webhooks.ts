import { createHmac } from 'crypto';
import { eq, and, sql } from 'drizzle-orm';
import { db, webhooks, webhookLogs, type Webhook, type NewWebhookLog } from '../db';

export type EventType = 
  | 'task.created'
  | 'task.updated'
  | 'task.completed'
  | 'task.blocked'
  | 'agent.status_changed'
  | 'decision.needed'
  | 'notification.new'
  | 'cost.recorded'
  | 'workflow.started'
  | 'workflow.completed';

// Trigger webhooks for a specific event type
export async function triggerWebhooks(eventType: EventType, payload: Record<string, any>): Promise<void> {
  try {
    console.log(`[Webhooks] Triggering webhooks for event: ${eventType}`);

    // Find all active webhooks subscribed to this event
    const activeWebhooks = await db
      .select()
      .from(webhooks)
      .where(
        and(
          eq(webhooks.isActive, true),
          sql`${eventType} = ANY(${webhooks.events})`
        )
      );

    console.log(`[Webhooks] Found ${activeWebhooks.length} active webhooks for ${eventType}`);

    if (activeWebhooks.length === 0) {
      return;
    }

    // Send webhook to each endpoint
    const promises = activeWebhooks.map(webhook => 
      sendWebhook(webhook, eventType, payload)
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error('[Webhooks] Error triggering webhooks:', error);
  }
}

// Send individual webhook with retries
async function sendWebhook(webhook: Webhook, eventType: EventType, payload: Record<string, any>): Promise<void> {
  const maxRetries = 3;
  const retryDelays = [1000, 5000, 30000]; // 1s, 5s, 30s

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const startTime = Date.now();
    
    try {
      console.log(`[Webhooks] Sending webhook ${webhook.id} attempt ${attempt + 1}/${maxRetries}`);

      // Create HMAC signature
      const payloadString = JSON.stringify(payload);
      const signature = createHmac('sha256', webhook.secret)
        .update(payloadString)
        .digest('hex');

      // Send HTTP request
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Orkwork-Signature': signature,
          'User-Agent': 'Orkwork-Webhooks/2.0',
        },
        body: payloadString,
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      const duration = Date.now() - startTime;
      const responseText = await response.text();

      // Log the delivery attempt
      await logWebhookDelivery(webhook.id, eventType, payload, response.status, responseText, duration, response.ok);

      if (response.ok) {
        console.log(`[Webhooks] Successfully sent webhook ${webhook.id} (${response.status})`);
        
        // Update last triggered timestamp and reset failure count
        await db
          .update(webhooks)
          .set({
            lastTriggeredAt: new Date(),
            failureCount: 0,
          })
          .where(eq(webhooks.id, webhook.id));

        return; // Success, no need to retry
      } else {
        console.warn(`[Webhooks] Webhook ${webhook.id} failed with status ${response.status}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[Webhooks] Error sending webhook ${webhook.id}:`, error);

      // Log the failed attempt
      await logWebhookDelivery(
        webhook.id, 
        eventType, 
        payload, 
        0, 
        error instanceof Error ? error.message : 'Unknown error', 
        duration, 
        false
      );
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries - 1) {
      console.log(`[Webhooks] Retrying webhook ${webhook.id} in ${retryDelays[attempt]}ms`);
      await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
    }
  }

  // All retries failed, increment failure count
  console.error(`[Webhooks] All attempts failed for webhook ${webhook.id}`);
  
  const [updatedWebhook] = await db
    .update(webhooks)
    .set({
      failureCount: sql`${webhooks.failureCount} + 1`,
    })
    .where(eq(webhooks.id, webhook.id))
    .returning();

  // Disable webhook after 10 consecutive failures
  if (updatedWebhook && updatedWebhook.failureCount >= 10) {
    console.warn(`[Webhooks] Disabling webhook ${webhook.id} after 10 consecutive failures`);
    
    await db
      .update(webhooks)
      .set({
        isActive: false,
      })
      .where(eq(webhooks.id, webhook.id));
  }
}

// Log webhook delivery attempt
async function logWebhookDelivery(
  webhookId: string,
  eventType: EventType,
  payload: Record<string, any>,
  responseStatus: number,
  responseBody: string,
  durationMs: number,
  success: boolean
): Promise<void> {
  try {
    const logEntry: NewWebhookLog = {
      webhookId,
      eventType,
      payload,
      responseStatus,
      responseBody: responseBody.length > 5000 ? responseBody.substring(0, 5000) + '...' : responseBody,
      durationMs,
      success,
    };

    await db.insert(webhookLogs).values(logEntry);
  } catch (error) {
    console.error('[Webhooks] Error logging webhook delivery:', error);
  }
}

// Send test webhook
export async function sendTestWebhook(webhook: Webhook): Promise<{ success: boolean; status?: number; error?: string }> {
  const testPayload = {
    type: 'webhook.test',
    timestamp: new Date().toISOString(),
    webhook_id: webhook.id,
    message: 'This is a test webhook from Orkwork',
  };

  const startTime = Date.now();

  try {
    console.log(`[Webhooks] Sending test webhook to ${webhook.url}`);

    // Create HMAC signature
    const payloadString = JSON.stringify(testPayload);
    const signature = createHmac('sha256', webhook.secret)
      .update(payloadString)
      .digest('hex');

    // Send HTTP request
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Orkwork-Signature': signature,
        'User-Agent': 'Orkwork-Webhooks/2.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(15000), // 15 second timeout for test
    });

    const duration = Date.now() - startTime;
    const responseText = await response.text();

    // Log the test delivery
    await logWebhookDelivery(webhook.id, 'webhook.test' as EventType, testPayload, response.status, responseText, duration, response.ok);

    return {
      success: response.ok,
      status: response.status,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error(`[Webhooks] Test webhook failed:`, error);

    // Log the failed test
    await logWebhookDelivery(webhook.id, 'webhook.test' as EventType, testPayload, 0, errorMessage, duration, false);

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Validate webhook event types
export function validateEventTypes(events: string[]): boolean {
  const validEvents: EventType[] = [
    'task.created',
    'task.updated', 
    'task.completed',
    'task.blocked',
    'agent.status_changed',
    'decision.needed',
    'notification.new',
    'cost.recorded',
    'workflow.started',
    'workflow.completed',
  ];

  return events.every(event => validEvents.includes(event as EventType));
}