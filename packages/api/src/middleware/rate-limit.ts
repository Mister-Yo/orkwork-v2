// Simple in-memory rate limiter
const store = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of store) {
    if (val.resetAt < now) store.delete(key);
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  windowMs?: number;  // default 60s
  max?: number;       // default 100
}

export function rateLimiter(opts: RateLimitOptions = {}) {
  const windowMs = opts.windowMs || 60_000;
  const max = opts.max || 100;

  return async (c: any, next: () => Promise<void>) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() 
      || c.req.header("x-real-ip") 
      || "unknown";
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, max - entry.count)));
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      return c.json({ error: "Too many requests" }, 429);
    }

    await next();
  };
}

// Stricter limiter for auth endpoints
export const authRateLimiter = rateLimiter({ windowMs: 60_000, max: 10 });
// General API limiter
export const apiRateLimiter = rateLimiter({ windowMs: 60_000, max: 100 });
// Deploy limiter
export const deployRateLimiter = rateLimiter({ windowMs: 300_000, max: 5 });
