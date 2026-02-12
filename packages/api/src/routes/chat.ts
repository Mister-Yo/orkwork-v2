import { Hono } from 'hono';
import { eq, desc, and, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, chatChannels, chatMessages, users, agents } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';
import { eventBus } from '../engine/events';
import { processMessage, postCommandResponse } from '../engine/chat-hooks';

const app = new Hono();

// All routes require auth
app.use('*', requireAuth);

// GET / — list channels
app.get('/', async (c) => {
  const channelList = await db
    .select()
    .from(chatChannels)
    .orderBy(chatChannels.createdAt);

  return c.json({ channels: channelList });
});

// POST / — create channel (admin+)
const createChannelSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(['general', 'project', 'team', 'direct']),
  projectId: z.string().uuid().optional(),
});

app.post('/', requireRole('admin'), async (c) => {
  const body = await c.req.json();
  const parsed = createChannelSchema.parse(body);
  const user = getAuthUser(c);

  const [channel] = await db
    .insert(chatChannels)
    .values({
      name: parsed.name,
      type: parsed.type,
      projectId: parsed.projectId || null,
      createdBy: user.id,
    })
    .returning();

  return c.json({ channel }, 201);
});

// GET /:channelId — get channel info
app.get('/:channelId', async (c) => {
  const channelId = c.req.param('channelId');

  const [channel] = await db
    .select()
    .from(chatChannels)
    .where(eq(chatChannels.id, channelId))
    .limit(1);

  if (!channel) {
    return c.json({ error: 'Channel not found' }, 404);
  }

  return c.json({ channel });
});

// GET /:channelId/messages — list messages (paginated)
app.get('/:channelId/messages', async (c) => {
  const channelId = c.req.param('channelId');
  const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100);
  const before = c.req.query('before');

  const conditions = [eq(chatMessages.channelId, channelId)];
  if (before) {
    conditions.push(lt(chatMessages.createdAt, new Date(before)));
  }

  const msgs = await db
    .select()
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit);

  // Fetch author info
  const userIds = [...new Set(msgs.filter(m => m.authorType === 'user').map(m => m.authorId))];
  const agentIds = [...new Set(msgs.filter(m => m.authorType === 'agent').map(m => m.authorId))];

  const userMap: Record<string, any> = {};
  const agentMap: Record<string, any> = {};

  if (userIds.length > 0) {
    const userRows = await db.select({ id: users.id, username: users.username, displayName: users.displayName, avatarUrl: users.avatarUrl }).from(users).where(sql`${users.id} IN ${userIds}`);
    for (const u of userRows) userMap[u.id] = u;
  }

  if (agentIds.length > 0) {
    const agentRows = await db.select({ id: agents.id, name: agents.name, type: agents.type }).from(agents).where(sql`${agents.id} IN ${agentIds}`);
    for (const a of agentRows) agentMap[a.id] = a;
  }

  const messages = msgs.map(m => ({
    ...m,
    author: m.authorType === 'user'
      ? userMap[m.authorId] || { id: m.authorId, username: 'unknown', displayName: 'Unknown User' }
      : agentMap[m.authorId] || { id: m.authorId, name: 'Unknown Agent' },
  }));

  return c.json({ messages });
});

// POST /:channelId/messages — send message
const sendMessageSchema = z.object({
  content: z.string().min(1).max(10000),
  replyTo: z.string().uuid().optional(),
});

app.post('/:channelId/messages', async (c) => {
  const channelId = c.req.param('channelId');
  const body = await c.req.json();
  const parsed = sendMessageSchema.parse(body);
  
  const authType = c.get('authType') as 'user' | 'agent' | undefined;
  const agent = c.get('agent') as any;
  const user = authType === 'agent' ? null : getAuthUser(c);

  // Verify channel exists
  const [channel] = await db.select().from(chatChannels).where(eq(chatChannels.id, channelId)).limit(1);
  if (!channel) {
    return c.json({ error: 'Channel not found' }, 404);
  }

  const authorId = authType === 'agent' ? agent.id : user!.id;
  const authorType = authType === 'agent' ? 'agent' : 'user';

  const [message] = await db
    .insert(chatMessages)
    .values({
      channelId,
      authorId,
      authorType: authorType as any,
      content: parsed.content,
      replyTo: parsed.replyTo || null,
    })
    .returning();

  // Attach author info
  const authorInfo = authType === 'agent'
    ? { id: agent.id, username: agent.name, displayName: agent.name, avatarUrl: null }
    : { id: user!.id, username: (user as any).username, displayName: (user as any).displayName, avatarUrl: (user as any).avatarUrl };
  const createdMessage = {
    ...message,
    author: authorInfo,
  };

  // Emit SSE event
  eventBus.emitEvent('chat.message' as any, { channelId, message: createdMessage });

  // Process chat commands (async, do not block response)
  processMessage(
    { id: message.id, channelId, authorId, authorType, content: parsed.content },
    authorInfo.displayName || authorInfo.username || "Unknown"
  ).then(async (response) => {
    if (response) {
      const [botAgent] = await db.select().from(agents).where(eq(agents.status, "active")).limit(1);
      if (botAgent) {
        await postCommandResponse(channelId, botAgent.id, response, message.id);
      }
    }
  }).catch((err) => {
    console.error("[ChatHooks] Error processing message:", err);
  });

  return c.json({ message: createdMessage }, 201);
});

// DELETE /:channelId/messages/:messageId — delete own message
app.delete('/:channelId/messages/:messageId', async (c) => {
  const messageId = c.req.param('messageId');
  const user = getAuthUser(c);

  const [msg] = await db.select().from(chatMessages).where(eq(chatMessages.id, messageId)).limit(1);
  if (!msg) {
    return c.json({ error: 'Message not found' }, 404);
  }

  // Only own messages or admin
  if (msg.authorId !== user.id && (user as any).role !== 'owner' && (user as any).role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  await db.delete(chatMessages).where(eq(chatMessages.id, messageId));
  return c.json({ success: true });
});

export default app;
