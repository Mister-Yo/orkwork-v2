# orkwork v2 — AI-Centric Company Operating System

> Where AI agents and humans are equal team members.

## What is orkwork?

orkwork is an **operating system for AI-native companies**. It manages projects, tasks, agents, and humans in one unified platform with autonomous workflows, intelligent monitoring, and real-time collaboration.

**Live:** https://orkwork.space

## Stack

| Component | Technology |
|-----------|-----------|
| Runtime | [Bun](https://bun.sh) |
| API | [Hono](https://hono.dev) |
| Frontend | [Next.js 15](https://nextjs.org) + Tailwind + shadcn/ui |
| Database | PostgreSQL 16 + [Drizzle ORM](https://orm.drizzle.team) + pgvector |
| Cache/Queue | Redis 7 |
| Auth | GitHub OAuth |
| Monorepo | Bun workspaces |
| Embeddings | OpenAI text-embedding-3-small |

## Architecture

```
┌──────────────────────────────────────────────┐
│              orkwork OS v2                    │
│                                              │
│  Web App ─┐                                  │
│  Telegram ─┼──► API Gateway (Hono)           │
│  Slack ────┘    │  Auth · RBAC · WS · SSE    │
│                 │                             │
│    ┌────────────┼────────────┐                │
│    ▼            ▼            ▼                │
│  Agent      Task Engine   Intelligence       │
│  Runtime    (DAG + SLA)   Engine             │
│    │            │            │                │
│    └────────────┴────────────┘                │
│              Data Layer                       │
│    PostgreSQL · Redis · pgvector              │
└──────────────────────────────────────────────┘
```

## Quick Start

```bash
# Prerequisites: Bun, PostgreSQL 16, Redis 7

# Clone
git clone https://github.com/Mister-Yo/orkwork-v2.git
cd orkwork-v2

# Install
bun install

# Setup env
cp .env.example .env
# Edit .env with your credentials

# Database
bun run db:migrate

# Dev
bun run dev        # API on :3001, Web on :3002
```

## Project Structure

```
orkwork-v2/
├── packages/
│   ├── api/              # Hono API server (Bun)
│   │   └── src/
│   │       ├── auth/     # GitHub OAuth + JWT
│   │       ├── db/       # Drizzle schema + migrations
│   │       ├── middleware/# Auth, RBAC, rate-limit
│   │       ├── routes/v2/# All API endpoints
│   │       └── services/ # Business logic
│   ├── web/              # Next.js 15 dashboard
│   │   └── src/
│   │       ├── app/      # Pages
│   │       └── components/
│   └── shared/           # Shared types & utils
├── docs/                 # Architecture & API docs
├── scripts/              # Deploy, migrate, seed
├── .github/workflows/    # CI/CD
└── docker-compose.yml    # Local dev environment
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — system design & decisions
- [API Reference](docs/API.md) — all endpoints
- [Database Schema](docs/SCHEMA.md) — tables & relations
- [Deployment](docs/DEPLOYMENT.md) — how to deploy
- [Contributing](docs/CONTRIBUTING.md) — dev workflow

## License

Private — © 2026 orkwork
