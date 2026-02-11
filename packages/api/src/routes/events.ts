import { Hono } from 'hono';
import { stream } from 'hono/streaming';
import { requireAuth, getAuthUser } from '../auth/middleware';
import { eventBus } from '../engine/events';

const app = new Hono();

// GET /api/v2/events/stream - Server-Sent Events endpoint
app.get('/stream', requireAuth, async (c) => {
  try {
    const user = getAuthUser(c);
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    console.log(`[SSE] New connection from ${user.username || user.agentId}`);

    return stream(c, async (stream) => {
      // Set SSE headers
      c.header('Content-Type', 'text/event-stream');
      c.header('Cache-Control', 'no-cache');
      c.header('Connection', 'keep-alive');
      c.header('Access-Control-Allow-Origin', '*');
      c.header('Access-Control-Allow-Headers', 'Cache-Control');

      // Send initial connection event
      await stream.write('data: {"type": "connection.opened", "payload": {"timestamp": "' + new Date().toISOString() + '"}}\n\n');

      let heartbeatInterval: NodeJS.Timeout;
      let isConnected = true;

      // Event listener for this connection
      const eventListener = async (type: string, payload: Record<string, any>) => {
        if (!isConnected) return;

        try {
          const eventData = JSON.stringify({ type, payload, timestamp: new Date().toISOString() });
          await stream.write(`data: ${eventData}\n\n`);
        } catch (error) {
          console.error('[SSE] Error writing to stream:', error);
          isConnected = false;
        }
      };

      // Subscribe to event bus
      eventBus.subscribe(eventListener);

      // Send heartbeat every 30 seconds to keep connection alive
      heartbeatInterval = setInterval(async () => {
        if (!isConnected) {
          clearInterval(heartbeatInterval);
          return;
        }

        try {
          const heartbeat = JSON.stringify({
            type: 'heartbeat',
            payload: { timestamp: new Date().toISOString() },
          });
          await stream.write(`data: ${heartbeat}\n\n`);
        } catch (error) {
          console.error('[SSE] Heartbeat error:', error);
          isConnected = false;
          clearInterval(heartbeatInterval);
        }
      }, 30000);

      // Handle connection cleanup
      stream.onAbort(() => {
        console.log(`[SSE] Connection aborted for ${user.username || user.agentId}`);
        isConnected = false;
        clearInterval(heartbeatInterval);
        eventBus.unsubscribe(eventListener);
      });

      // Keep the stream open indefinitely
      // The stream will close when client disconnects or an error occurs
      await new Promise((resolve) => {
        const checkConnection = () => {
          if (!isConnected) {
            resolve(undefined);
          } else {
            setTimeout(checkConnection, 1000);
          }
        };
        checkConnection();
      });

      // Cleanup
      clearInterval(heartbeatInterval);
      eventBus.unsubscribe(eventListener);
      console.log(`[SSE] Connection closed for ${user.username || user.agentId}`);
    });
  } catch (error) {
    console.error('[SSE] Error in events stream:', error);
    return c.json({ error: 'Failed to create event stream' }, 500);
  }
});

// GET /api/v2/events/status - Get SSE connection status
app.get('/status', requireAuth, async (c) => {
  try {
    const connectionCount = eventBus.getConnectionCount();
    
    return c.json({
      status: 'ok',
      connections: connectionCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[SSE] Error getting status:', error);
    return c.json({ error: 'Failed to get event status' }, 500);
  }
});

export default app;