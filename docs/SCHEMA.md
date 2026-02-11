# Database Schema — orkwork v2

PostgreSQL 16 with pgvector extension.

## Tables

### Core

| Table | Purpose |
|-------|---------|
| `employees` | All team members (human + agent) |
| `agents` | AI agent configuration & runtime state |
| `projects` | Projects with health scores & budgets |
| `project_members` | Project ↔ employee assignments |
| `tasks` | Tasks with DAG dependencies & SLA |
| `task_dependencies` | Task dependency graph (blocks/soft/related) |
| `task_executions` | Detailed execution logs per task run |

### Intelligence

| Table | Purpose |
|-------|---------|
| `agent_capabilities` | What each agent can do (skills + proficiency) |
| `agent_memory` | Long-term agent knowledge (pgvector embeddings) |
| `cost_entries` | Granular cost tracking (tokens, compute, API) |
| `sla_rules` | SLA definitions with escalation chains |
| `decisions` | Audit log — every decision with reasoning |
| `evaluations` | Performance evaluations (AI-generated) |

### Communication

| Table | Purpose |
|-------|---------|
| `notifications` | Multi-channel notification queue |
| `workflows` | Reusable task templates with triggers |
| `knowledge_items` | Knowledge base entries with embeddings |
| `activity_log` | System-wide activity feed |
| `status_reports` | Project status reports |

### Auth

| Table | Purpose |
|-------|---------|
| `api_keys` | API keys for agents & integrations |
| `sessions` | Active JWT sessions |

## Key Relationships

```
employees ──┬── agents (1:1 for AI employees)
            ├── project_members ── projects
            ├── tasks (assignee)
            └── api_keys

tasks ──┬── task_dependencies (DAG)
        ├── task_executions (runs)
        └── projects

agents ──┬── agent_capabilities
         ├── agent_memory (pgvector)
         ├── cost_entries
         └── task_executions
```

## Enums

- `employee_type`: human, agent
- `agent_status`: active, idle, working, error, retired
- `task_status`: created, planning, ready, assigned, in_progress, review, completed, blocked, escalated, cancelled
- `autonomy_level`: tool, assistant, supervised, autonomous, strategic
- `priority`: urgent, high, normal, low
- `notification_channel`: telegram, email, web, slack
- `cost_type`: api_tokens, compute, storage, external_api
- `decision_type`: task_assign, deploy, escalate, approve, budget
