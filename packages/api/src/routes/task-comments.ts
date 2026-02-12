import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, taskComments, type NewTaskComment } from '../db';
import { requireAuth, getAuthUser, getAuthAgent } from '../auth/middleware';

const app = new Hono();

const createCommentSchema = z.object({
  content: z.string().min(1).max(10000),
});

// GET /api/v2/tasks/:taskId/comments
app.get('/:taskId/comments', requireAuth, async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const comments = await db.execute(sql`
      SELECT tc.*,
        CASE
          WHEN tc.author_type = 'user' THEN (SELECT username FROM users WHERE id = tc.author_id)
          ELSE (SELECT name FROM agents WHERE id = tc.author_id)
        END as author_name,
        CASE
          WHEN tc.author_type = 'user' THEN (SELECT avatar_url FROM users WHERE id = tc.author_id)
          ELSE NULL
        END as author_avatar
      FROM task_comments tc
      WHERE tc.task_id = ${taskId}
      ORDER BY tc.created_at ASC
    `);
    return c.json({ comments: comments.rows ?? comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// POST /api/v2/tasks/:taskId/comments
app.post('/:taskId/comments', requireAuth, async (c) => {
  try {
    const taskId = c.req.param('taskId');
    const body = await c.req.json();
    const { content } = createCommentSchema.parse(body);

    const user = getAuthUser(c);
    const agent = getAuthAgent(c);

    const newComment: NewTaskComment = {
      taskId,
      content,
      authorId: user?.id ?? agent?.id ?? '',
      authorType: agent ? 'agent' : 'user',
    };

    const [comment] = await db.insert(taskComments).values(newComment).returning();

    // Fetch with author info
    const result = await db.execute(sql`
      SELECT tc.*,
        CASE
          WHEN tc.author_type = 'user' THEN (SELECT username FROM users WHERE id = tc.author_id)
          ELSE (SELECT name FROM agents WHERE id = tc.author_id)
        END as author_name,
        CASE
          WHEN tc.author_type = 'user' THEN (SELECT avatar_url FROM users WHERE id = tc.author_id)
          ELSE NULL
        END as author_avatar
      FROM task_comments tc
      WHERE tc.id = ${comment.id}
    `);

    return c.json({ comment: (result.rows ?? result)[0] }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', issues: error.issues }, 400);
    }
    console.error('Error creating comment:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// DELETE /api/v2/tasks/:taskId/comments/:commentId
app.delete('/:taskId/comments/:commentId', requireAuth, async (c) => {
  try {
    const commentId = c.req.param('commentId');
    const user = getAuthUser(c);
    const agent = getAuthAgent(c);
    const authorId = user?.id ?? agent?.id;

    // Only author or owner can delete
    const [existing] = await db.select().from(taskComments).where(eq(taskComments.id, commentId)).limit(1);
    if (!existing) return c.json({ error: 'Comment not found' }, 404);
    if (existing.authorId !== authorId && user?.role !== 'owner' && user?.role !== 'admin') {
      return c.json({ error: 'Not authorized' }, 403);
    }

    await db.delete(taskComments).where(eq(taskComments.id, commentId));
    return c.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

export default app;
