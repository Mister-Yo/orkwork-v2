# orkwork API v2

The backend API for the orkwork platform built with Hono and Bun.

## Features

- **Authentication**: GitHub OAuth with session management
- **Role-based Access Control**: Owner/Admin/Member/Viewer roles
- **Agent Management**: CRUD operations for AI agents
- **User Management**: User administration and role assignment
- **Health Checks**: Comprehensive health monitoring
- **Database**: PostgreSQL with Drizzle ORM
- **Caching**: Redis for session storage

## Getting Started

### Prerequisites

- Bun runtime
- PostgreSQL 16+ with pgvector extension
- Redis 7+
- GitHub OAuth app

### Installation

```bash
# Install dependencies
bun install

# Copy environment file
cp ../../.env.example .env

# Configure your environment variables in .env

# Run database migrations
bun run db:migrate

# Start development server
bun run dev
```

### Environment Variables

Required variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret
- `SESSION_SECRET` - Secret for session signing (32+ characters)

## API Endpoints

### Authentication
- `GET /api/auth/github` - Redirect to GitHub OAuth
- `GET /api/auth/github/callback` - GitHub OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Agents (requires auth)
- `GET /api/v2/agents` - List agents
- `POST /api/v2/agents` - Create agent (admin+)
- `GET /api/v2/agents/:id` - Get agent
- `PATCH /api/v2/agents/:id` - Update agent (admin+)
- `DELETE /api/v2/agents/:id` - Delete agent (owner only)

### Users (requires auth)  
- `GET /api/v2/users` - List users (admin+)
- `GET /api/v2/users/:id` - Get user
- `PATCH /api/v2/users/:id/role` - Change role (owner only)

### Health
- `GET /api/health` - Basic health check
- `GET /api/health?detailed=true` - Detailed health check
- `GET /api/health/ready` - Readiness probe
- `GET /api/health/live` - Liveness probe

## Role Hierarchy

1. **Owner** - Full access, can manage roles
2. **Admin** - Manage agents and users
3. **Member** - Basic access to assigned resources
4. **Viewer** - Read-only access

## Development

```bash
# Type checking
bun run lint

# Database operations
bun run db:migrate     # Run migrations
bun run db:seed       # Seed database

# Start development server  
bun run dev

# Build for production
bun run build

# Start production server
bun run start
```

## Architecture

- **Framework**: Hono (lightweight, fast)
- **Runtime**: Bun (TypeScript-native)
- **Database**: PostgreSQL 16 + Drizzle ORM
- **Auth**: GitHub OAuth + session cookies
- **Validation**: Zod schemas
- **Security**: CORS, secure headers, CSRF protection