// Simple in-memory event bus for real-time notifications
// Uses EventEmitter pattern for SSE connections

import { triggerWebhooks } from './webhooks';

type EventType = 
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

type EventPayload = Record<string, any>;

type EventCallback = (type: EventType, payload: EventPayload) => void;

class EventBus {
  private listeners: Set<EventCallback> = new Set();

  // Subscribe to all events
  subscribe(callback: EventCallback): void {
    this.listeners.add(callback);
  }

  // Unsubscribe from events
  unsubscribe(callback: EventCallback): void {
    this.listeners.delete(callback);
  }

  // Emit event to all listeners (SSE connections)
  emitEvent(type: EventType, payload: EventPayload): void {
    console.log(`[EventBus] Emitting ${type} to ${this.listeners.size} listeners`);
    
    // Send to SSE listeners
    for (const listener of this.listeners) {
      try {
        listener(type, payload);
      } catch (error) {
        console.error(`[EventBus] Error in event listener:`, error);
        // Remove broken listener
        this.listeners.delete(listener);
      }
    }

    // Trigger webhooks (don't await to avoid blocking SSE)
    triggerWebhooks(type, payload).catch(error => {
      console.error(`[EventBus] Error triggering webhooks for ${type}:`, error);
    });
  }

  // Get number of active connections
  getConnectionCount(): number {
    return this.listeners.size;
  }
}

// Singleton event bus instance
export const eventBus = new EventBus();

// Convenience functions for specific events
export function emitTaskCreated(task: Record<string, any>): void {
  eventBus.emitEvent('task.created', { task });
}

export function emitTaskUpdated(task: Record<string, any>): void {
  eventBus.emitEvent('task.updated', { task });
}

export function emitTaskCompleted(task: Record<string, any>): void {
  eventBus.emitEvent('task.completed', { task });
}

export function emitTaskBlocked(task: Record<string, any>): void {
  eventBus.emitEvent('task.blocked', { task });
}

export function emitAgentStatusChanged(agent: Record<string, any>): void {
  eventBus.emitEvent('agent.status_changed', { agent });
}

export function emitDecisionNeeded(decision: Record<string, any>): void {
  eventBus.emitEvent('decision.needed', { decision });
}

export function emitNotificationNew(notification: Record<string, any>): void {
  eventBus.emitEvent('notification.new', { notification });
}

export function emitCostRecorded(costEntry: Record<string, any>): void {
  eventBus.emitEvent('cost.recorded', { costEntry });
}

export function emitWorkflowStarted(workflow: Record<string, any>): void {
  eventBus.emitEvent('workflow.started', { workflow });
}

export function emitWorkflowCompleted(workflow: Record<string, any>): void {
  eventBus.emitEvent('workflow.completed', { workflow });
}