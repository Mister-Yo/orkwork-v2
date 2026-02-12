import { Hono } from 'hono';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db, users, sessions, type User } from '../db';
import { requireAuth, requireRole, getAuthUser } from '../auth/middleware';

const app = new Hono();

// Validation schemas
const updateRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'member', 'pending', 'viewer']),
});

const updateUserSchema = z.object({
  title: z.string().max(255).optional(),
  department: z.string().max(100).optional(),
});

// GET /api/v2/users - List users (admin+)
app.get('/', requireRole('admin'), async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = Math.min(parseInt(c.req.query('limit') || '20', 10), 100);
    const offset = (page - 1) * limit;

    const role = c.req.query('role');
    const search = c.req.query('search');

    const conditions = [];
    if (role) {
      conditions.push(eq(users.role, role as any));
    }
    if (search) {
      conditions.push(
        sql`(${users.username} ILIKE ${`%${search}%`} OR ${users.displayName} ILIKE ${`%${search}%`} OR ${users.email} ILIKE ${`%${search}%`})`
      );
    }

    const [usersList, totalResult] = await Promise.all([
      db
        .select({
          id: users.id,
          githubId: users.githubId,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          email: users.email,
          role: users.role,
          title: users.title,
          department: users.department,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          reportsTo: sql`reports_to`.as("reportsTo"),
        })
        .from(users)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
        .orderBy(users.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql`count(*)`.as('count') })
        .from(users)
        .where(conditions.length > 0 ? sql`${sql.join(conditions, sql` AND `)}` : undefined)
    ]);

    const total = Number(totalResult[0].count);
    const totalPages = Math.ceil(total / limit);

    return c.json({
      users: usersList,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// GET /api/v2/users/stats - Get user statistics (admin+)
app.get('/stats', requireRole('admin'), async (c) => {
  try {
    const stats = await db
      .select({
        role: users.role,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(users)
      .groupBy(users.role);

    const totalUsers = stats.reduce((sum, stat) => sum + Number(stat.count), 0);

    return c.json({
      totalUsers,
      byRole: stats.reduce((acc, stat) => {
        acc[stat.role] = Number(stat.count);
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return c.json({ error: 'Failed to fetch user statistics' }, 500);
  }
});

// GET /api/v2/users/:id - Get specific user
app.get('/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getAuthUser(c);

    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    if (id !== currentUser.id && currentUser.role !== 'admin' && currentUser.role !== 'owner') {
      return c.json({ error: 'Insufficient permissions' }, 403);
    }

    const user = await db
      .select({
        id: users.id,
        githubId: users.githubId,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        email: users.email,
        role: users.role,
        title: users.title,
        department: users.department,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user: user[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

// POST /api/v2/users/:id/approve - Approve pending user (admin+)
app.post('/:id/approve', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');

    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (targetUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    if (targetUser[0].role !== 'pending') {
      return c.json({ error: 'User is not pending approval' }, 400);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role: 'member', updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return c.json({ message: 'User approved', user: updatedUser });
  } catch (error) {
    console.error('Error approving user:', error);
    return c.json({ error: 'Failed to approve user' }, 500);
  }
});

// POST /api/v2/users/:id/reject - Reject pending user (admin+)
app.post('/:id/reject', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');

    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (targetUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Delete their sessions first
    await db.delete(sessions).where(eq(sessions.userId, id));
    await db.delete(users).where(eq(users.id, id));

    return c.json({ message: 'User rejected and removed' });
  } catch (error) {
    console.error('Error rejecting user:', error);
    return c.json({ error: 'Failed to reject user' }, 500);
  }
});

// PATCH /api/v2/users/:id - Update user title/department (admin+)
app.patch('/:id', requireRole('admin'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const validatedData = updateUserSchema.parse(body);

    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (targetUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return c.json({ message: 'User updated', user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', issues: error.issues }, 400);
    }
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// PATCH /api/v2/users/:id/role - Change user role (owner only)
app.patch('/:id/role', requireRole('owner'), async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const currentUser = getAuthUser(c);

    if (!id) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const validatedData = updateRoleSchema.parse(body);

    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (targetUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    if (id === currentUser.id) {
      return c.json({ error: 'Cannot change your own role' }, 400);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ role: validatedData.role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return c.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', issues: error.issues }, 400);
    }
    console.error('Error updating user role:', error);
    return c.json({ error: 'Failed to update user role' }, 500);
  }
});

// DELETE /api/v2/users/:id - Delete user (owner only)
app.delete('/:id', requireRole('owner'), async (c) => {
  try {
    const id = c.req.param('id');
    const currentUser = getAuthUser(c);

    if (id === currentUser.id) {
      return c.json({ error: 'Cannot delete yourself' }, 400);
    }

    const targetUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (targetUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }

    await db.delete(sessions).where(eq(sessions.userId, id));
    await db.delete(users).where(eq(users.id, id));

    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export default app;
