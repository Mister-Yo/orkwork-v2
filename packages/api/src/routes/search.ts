import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../db';
import { requireAuth } from '../auth/middleware';

const app = new Hono();
app.use('*', requireAuth);

app.get('/', async (c) => {
  const q = c.req.query('q')?.trim();
  if (!q || q.length < 2) return c.json({ results: [] });

  const pattern = `%${q}%`;

  const [agents, tasks, projects, decisions] = await Promise.all([
    db.execute(sql`SELECT id, name AS title, type AS subtitle, 'agent' AS type FROM agents WHERE name ILIKE ${pattern} OR type ILIKE ${pattern} LIMIT 5`),
    db.execute(sql`SELECT id, title, status AS subtitle, 'task' AS type FROM tasks WHERE title ILIKE ${pattern} OR description ILIKE ${pattern} LIMIT 5`),
    db.execute(sql`SELECT id, name AS title, status AS subtitle, 'project' AS type FROM projects WHERE name ILIKE ${pattern} OR description ILIKE ${pattern} LIMIT 5`),
    db.execute(sql`SELECT id, title, status AS subtitle, 'decision' AS type FROM decisions WHERE title ILIKE ${pattern} OR description ILIKE ${pattern} LIMIT 5`),
  ]);

  const results = [
    ...agents.rows.map((r: any) => ({ ...r, url: `/agents/${r.id}` })),
    ...tasks.rows.map((r: any) => ({ ...r, url: `/tasks/${r.id}` })),
    ...projects.rows.map((r: any) => ({ ...r, url: `/projects/${r.id}` })),
    ...decisions.rows.map((r: any) => ({ ...r, url: `/decisions/${r.id}` })),
  ];

  return c.json({ results, query: q });
});

export default app;
