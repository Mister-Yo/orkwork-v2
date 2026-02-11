# Architecture — orkwork v2

## Design Principles

1. **Agents are first-class citizens** — same status as human employees
2. **Autonomy with guardrails** — agents act within defined boundaries
3. **Everything is auditable** — every decision logged with reasoning
4. **Real-time by default** — WebSocket/SSE, not polling
5. **Cost-aware** — every API call, every token tracked

## Core Modules

### 1. API Gateway (Hono)
Single entry point for all clients. Handles:
- **Auth**: GitHub OAuth for humans, API keys for agents
- **RBAC**: Role-based access (CEO, CTO, Manager, Agent, Viewer)
- **Rate limiting**: Per-user/agent request limits
- **WebSocket**: Real-time events for dashboard + agent communication
- **SSE**: Server-sent events for live feed

### 2. Agent Runtime
Manages the lifecycle of AI agents:
- **Registry**: Capabilities, permissions, SLA per agent
- **Lifecycle**: Spawn → configure → monitor → retire
- **Memory**: Short-term (context window) + long-term (pgvector)
- **Health**: Heartbeat monitoring, auto-restart on failure
- **Budget**: Daily/monthly spending limits per agent

### 3. Task Engine
DAG-based task management with auto-assignment:
- **Task Graph**: Dependencies between tasks (blocks, soft, related)
- **Auto-Assignment**: Score-based matching (capability × workload × history × cost)
- **Workflows**: Reusable multi-step templates with human gates
- **SLA**: Time limits with automatic escalation chain
- **Execution Tracking**: Real-time progress, token usage, cost per task

### 4. Intelligence Engine
AI-powered monitoring and insights:
- **Daily Brief**: Auto-generated morning summary for CEO
- **Anomaly Detection**: Stale agents, budget spikes, cyclic blockers
- **Performance Scoring**: Weighted metrics per agent/project
- **Cost Analytics**: Token usage, API costs, per-model breakdown
- **Forecasting**: Project completion predictions, bottleneck detection

### 5. Communications Hub
Unified messaging across all channels:
- **Channels**: Project channels, direct messages, system notifications
- **Adapters**: Telegram, Slack, Discord, Email, Web
- **Smart Routing**: Urgent → push, info → digest, FYI → web only

## Auth Flow

```
User clicks "Login with GitHub"
  → Redirect to GitHub OAuth
  → GitHub callback with code
  → Exchange code for GitHub access token
  → Fetch user profile from GitHub API
  → Find or create employee record
  → Generate JWT (access: 15min, refresh: 7d)
  → Return tokens to client
```

## Data Flow

```
Client Request
  → API Gateway (auth + rate limit)
  → Route Handler
  → Service Layer (business logic)
  → Drizzle ORM
  → PostgreSQL
  → Response (JSON or WebSocket event)
```

## Deployment

```
GitHub Push → GitHub Actions CI
  → Lint + Type check + Test
  → Build API (Bun bundle)
  → Build Web (Next.js standalone)
  → SSH deploy to DigitalOcean
  → Health check
  → Notify team
```

## Infrastructure

| Service | Host | Port |
|---------|------|------|
| API (Hono) | DigitalOcean | 3001 |
| Web (Next.js) | DigitalOcean | 3002 |
| PostgreSQL 16 | DigitalOcean | 5432 |
| Redis 7 | DigitalOcean | 6379 |
| Caddy (reverse proxy) | DigitalOcean | 80/443 |

Domain: orkwork.space (Caddy auto-SSL via Let's Encrypt)
