# Security Audit Report — orkwork-v2

**Date:** 2026-02-11
**Auditor:** Automated Security Audit
**Server:** 134.209.162.250 (DigitalOcean)
**Domain:** orkwork.space

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH | 3 |
| MEDIUM | 4 |
| LOW | 2 |
| INFO | 8 |

**Overall Score: 58/100 (Needs Improvement)**

---

## Findings

### CRITICAL

#### C1. SSH Root Login with Password Enabled
- **Finding:** `PermitRootLogin yes` and `PasswordAuthentication yes` in sshd_config
- **Risk:** Brute-force attacks can gain full root access. This is the single biggest vulnerability.
- **Recommendation:** Set `PermitRootLogin prohibit-password` and `PasswordAuthentication no`, then restart SSH. Ensure key-based access works first.

#### C2. fail2ban is Inactive
- **Finding:** fail2ban service is inactive/not running
- **Risk:** Combined with C1, there is zero brute-force protection on SSH.
- **Recommendation:** Install and enable fail2ban with sshd jail at minimum.

---

### HIGH

#### H1. .env File World-Readable (644)
- **Finding:** `/opt/orkwork-v2/.env` has permissions `-rw-r--r--` (644), readable by all local users.
- **Risk:** Any local user or compromised service can read database credentials, GitHub OAuth secrets, and session secret.
- **Recommendation:** `chmod 600 /opt/orkwork-v2/.env`

#### H2. Multiple Services Exposed on All Interfaces
- **Finding:** Ports 3001 (legacy API), 3010 (v2 API), 3020 (Next.js), 8787 (unknown) are listening on `*` (all interfaces), bypassing Caddy reverse proxy.
- **Risk:** Direct access to backend APIs without TLS, CORS enforcement, or reverse proxy protections. Anyone can hit these ports directly.
- **Recommendation:** Bind all services to `127.0.0.1` only, or block with UFW: `ufw deny 3001; ufw deny 3010; ufw deny 3020; ufw deny 8787`

#### H3. No Rate Limiting
- **Finding:** No rate limiting middleware found on any API route.
- **Risk:** API abuse, brute-force on auth endpoints, denial of service.
- **Recommendation:** Implement rate limiting (especially on `/api/auth/*` and `/api/v2/deploy/*`). Use Redis-backed limiter for distributed support.

---

### MEDIUM

#### M1. No Security Headers Reaching Browser
- **Finding:** `curl -sI https://orkwork.space` returned zero security headers (no HSTS, X-Frame-Options, CSP, etc.)
- **Note:** Hono's `secureHeaders()` is applied, but the frontend is served by Next.js via Caddy — headers may not propagate.
- **Recommendation:** Add security headers in Caddyfile globally:
  ```
  header {
      Strict-Transport-Security "max-age=31536000; includeSubDomains"
      X-Frame-Options "DENY"
      X-Content-Type-Options "nosniff"
      Referrer-Policy "strict-origin-when-cross-origin"
  }
  ```

#### M2. Deploy Endpoint Executes Shell Commands as Root
- **Finding:** `/api/v2/deploy/pull` uses `child_process.exec()` to run git, bun, and systemctl commands.
- **Risk:** While guarded by `requireRole('admin')`, the service runs as root. Any command injection would have full system access.
- **Recommendation:** Use `execFile` instead of `exec`. Create a dedicated deploy user with limited sudo privileges.

#### M3. GitHub Webhook Deploy Has No Auth Middleware
- **Finding:** `POST /api/v2/deploy/webhook/github` is publicly accessible. HMAC validation depends on `DEPLOY_WEBHOOK_SECRET` being set.
- **Risk:** If secret is unset, returns 500 but confirms endpoint exists. No IP allowlisting.
- **Recommendation:** Verify secret is configured. Add GitHub IP allowlisting.

#### M4. 30-Day Session Lifetime
- **Finding:** Session cookies have `maxAge: 30 days`.
- **Risk:** Long-lived sessions increase token theft window.
- **Recommendation:** Reduce to 7 days with sliding renewal or implement refresh tokens.

---

### LOW

#### L1. Error Handler Leaks Stack Traces in Dev Mode
- **Finding:** Error responses include message and stack trace when `NODE_ENV !== 'production'`.
- **Risk:** Low if production env is correctly set. Verify `NODE_ENV=production` in .env.

#### L2. Uptime Kuma Publicly Accessible
- **Finding:** Monitoring dashboard at `/status/` is publicly accessible via Caddy.
- **Risk:** Reveals infrastructure details (services monitored, uptime history).
- **Recommendation:** Add basic auth or restrict to authenticated users.

---

### INFO (Positive Findings)

#### I1. Firewall Configuration ✅
UFW active with default deny incoming. Only 22, 80, 443 open.

#### I2. Database Security ✅
PostgreSQL on localhost only, scram-sha-256 auth, `orkwork` user has no superuser privileges, Redis on localhost only.

#### I3. Cookie Security ✅
httpOnly, secure (production), sameSite lax. Session tokens SHA-256 hashed before DB storage.

#### I4. SQL Injection Protection ✅
Drizzle ORM with parameterized queries. Zod input validation on routes.

#### I5. CORS Configuration ✅
Explicit origin allowlist from env var. Credentials mode with proper headers.

#### I6. Secrets Management ✅
.env in .gitignore. No hardcoded secrets in source. Env validated with Zod schema on startup.

#### I7. SSL/TLS ✅
TLSv1.3 (CHACHA20-POLY1305). Certificate valid until May 2026. Auto-managed by Caddy.

#### I8. Auth Middleware Coverage ✅
Global auth middleware + per-route `requireAuth`/`requireRole` guards. Health endpoints appropriately public.

---

## Priority Action Items

1. 🔴 **IMMEDIATE:** Disable SSH password auth and root login (C1)
2. 🔴 **IMMEDIATE:** Enable fail2ban (C2)
3. 🟠 **THIS WEEK:** Restrict .env to 600 permissions (H1)
4. 🟠 **THIS WEEK:** Bind services to localhost or block ports via UFW (H2)
5. 🟡 **NEXT SPRINT:** Implement rate limiting (H3)
6. 🟡 **NEXT SPRINT:** Add security headers in Caddyfile (M1)
7. 🔵 **BACKLOG:** Harden deploy endpoint (M2, M3)
8. 🔵 **BACKLOG:** Reduce session lifetime (M4)

---

*Report generated 2026-02-11. Next audit recommended in 90 days.*
