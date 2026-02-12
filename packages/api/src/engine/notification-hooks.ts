import { eventBus } from './events';
import { createNotification } from './notifications';

const CEO_USER_ID = '09670672-bfeb-455c-9e32-ab6aaea194ef';

// Telegram config (optional)
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegram(text: string): Promise<void> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (error) {
    console.error('[NotificationHooks] Telegram send failed:', error);
  }
}

export function registerNotificationHooks(): void {
  console.log('[NotificationHooks] Registering event listeners for auto-notifications');

  eventBus.subscribe(async (type, payload) => {
    try {
      switch (type) {
        case 'task.completed': {
          const task = payload.task;
          if (!task) break;
          await createNotification({
            recipientType: 'user',
            recipientId: CEO_USER_ID,
            channel: 'web',
            priority: 'normal',
            title: `Task completed: ${task.title || task.id}`,
            body: `Task "${task.title}" has been completed successfully.`,
            metadata: { taskId: task.id, eventType: type },
          });
          break;
        }

        case 'task.blocked': {
          const task = payload.task;
          if (!task) break;
          await createNotification({
            recipientType: 'user',
            recipientId: CEO_USER_ID,
            channel: 'web',
            priority: 'high',
            title: `Task blocked: ${task.title || task.id}`,
            body: `Task "${task.title}" is blocked and needs attention.`,
            metadata: { taskId: task.id, eventType: type },
          });
          // Also send to Telegram for urgent items
          await sendTelegram(
            `<b>Task Blocked</b>\n${task.title}\n${task.description || 'No description'}`
          );
          break;
        }

        case 'decision.needed': {
          const decision = payload.decision;
          if (!decision) break;
          await createNotification({
            recipientType: 'user',
            recipientId: CEO_USER_ID,
            channel: 'web',
            priority: 'urgent',
            title: `Approval needed: ${decision.decisionType || 'action'}`,
            body: decision.context || 'An agent needs your approval to proceed.',
            metadata: { decisionId: decision.id, eventType: type },
          });
          // Always Telegram for approvals
          await sendTelegram(
            `<b>Approval Needed</b>\nType: ${decision.decisionType}\n${decision.context || ''}`
          );
          break;
        }

        case 'agent.status_changed': {
          const agent = payload.agent;
          if (!agent) break;
          // Only notify on errors
          if (agent.status === 'error' || agent.status === 'offline') {
            await createNotification({
              recipientType: 'user',
              recipientId: CEO_USER_ID,
              channel: 'web',
              priority: 'high',
              title: `Agent ${agent.status}: ${agent.name}`,
              body: `Agent "${agent.name}" status changed to ${agent.status}.`,
              metadata: { agentId: agent.id, eventType: type },
            });
            await sendTelegram(
              `<b>Agent ${agent.status.toUpperCase()}</b>\n${agent.name}`
            );
          }
          break;
        }

        case 'cost.recorded': {
          const entry = payload.costEntry;
          if (!entry) break;
          // Only notify on high costs (> $1)
          const costUsd = (entry.amount || 0) / 100;
          if (costUsd > 1) {
            await createNotification({
              recipientType: 'user',
              recipientId: CEO_USER_ID,
              channel: 'web',
              priority: 'normal',
              title: `High cost alert: $${costUsd.toFixed(2)}`,
              body: `A task incurred $${costUsd.toFixed(2)} in API costs.`,
              metadata: { costEntryId: entry.id, eventType: type },
            });
          }
          break;
        }

        default:
          // Don't create notifications for other events
          break;
      }
    } catch (error) {
      console.error(`[NotificationHooks] Error processing ${type}:`, error);
    }
  });

  console.log('[NotificationHooks] Event listeners registered');
}
