# orkwork v2 — Детальний план розробки

**Створено:** 2026-02-11
**Оновлено:** 2026-02-11
**Оцінка:** ~14 тижнів (3.5 місяці)

---

## Що вже зроблено ✅

- [x] Домен orkwork.space + SSL + Caddy
- [x] GitHub repo (Mister-Yo/orkwork-v2), монорепо (api/web/shared)
- [x] PostgreSQL DB `orkwork_v2` (7 таблиць, pgvector)
- [x] API на Bun + Hono, порт 3010, systemd сервіс
- [x] GitHub OAuth (login/callback/me/logout)
- [x] RBAC middleware (owner/admin/member/viewer)
- [x] Agent CRUD API
- [x] User management API
- [x] Health check endpoints
- [x] Yuriy зареєстрований як owner

---

## Phase 1: Foundation (тижні 1-2)

### 1.1 Розширення БД схеми
- [ ] Таблиця `agent_memory` (content, embedding vector(1536), relevance_score, TTL)
- [ ] Таблиця `task_dependencies` (task_id, depends_on, dependency_type)
- [ ] Таблиця `task_executions` (agent_id, task_id, status, output, tokens, cost, duration)
- [ ] Таблиця `workflows` (name, steps JSONB, trigger_type, trigger_config)
- [ ] Таблиця `workflow_runs` (workflow_id, status, started_at, completed_at, results)
- [ ] Таблиця `notifications` (recipient, channel, priority, title, body, status)
- [ ] Таблиця `decisions` (type, made_by, context, decision, reasoning, outcome)
- [ ] Таблиця `sla_rules` (target_type, max_response_min, max_resolution_min, escalation_chain)
- [ ] Таблиця `audit_log` (actor, action, resource, details, ip, timestamp)
- [ ] Таблиця `chat_channels` (name, type, project_id)
- [ ] Таблиця `chat_messages` (channel_id, author_id, content, reply_to, attachments)
- [ ] ALTER agents: + daily_budget_usd, total_spent_usd, autonomy_level, max_concurrent_tasks
- [ ] ALTER tasks: + acceptance_criteria, review_required, auto_assigned, retry_count, max_retries
- [ ] ALTER projects: + budget_usd, spent_usd, deadline, health_score, risk_level

### 1.2 API Keys для агентів
- [ ] Таблиця `api_keys` (agent_id, key_hash, scopes[], expires_at, last_used_at)
- [ ] Middleware: API key auth (Bearer token → agent context)
- [ ] POST /api/v2/agents/:id/keys — створити ключ
- [ ] DELETE /api/v2/agents/:id/keys/:keyId — відкликати ключ
- [ ] Scopes: `tasks:read`, `tasks:write`, `agents:read`, `memory:write`, etc.

### 1.3 Projects CRUD
- [ ] GET /api/v2/projects — список проектів
- [ ] POST /api/v2/projects — створити проект
- [ ] GET /api/v2/projects/:id — деталі проекту
- [ ] PATCH /api/v2/projects/:id — оновити
- [ ] DELETE /api/v2/projects/:id — видалити (owner)
- [ ] GET /api/v2/projects/:id/tasks — задачі проекту
- [ ] GET /api/v2/projects/:id/costs — витрати проекту

### 1.4 Tasks CRUD (розширений)
- [ ] GET /api/v2/tasks — список (фільтри: status, priority, assignee, project)
- [ ] POST /api/v2/tasks — створити задачу
- [ ] GET /api/v2/tasks/:id — деталі
- [ ] PATCH /api/v2/tasks/:id — оновити
- [ ] DELETE /api/v2/tasks/:id — видалити
- [ ] POST /api/v2/tasks/:id/dependencies — додати залежність
- [ ] DELETE /api/v2/tasks/:id/dependencies/:depId — видалити залежність
- [ ] GET /api/v2/tasks/graph — DAG (для візуалізації)
- [ ] PATCH /api/v2/tasks/:id/status — зміна статусу (з валідацією transitions)

### 1.5 Audit Log
- [ ] Middleware: автоматичний запис всіх мутацій в audit_log
- [ ] GET /api/v2/audit — перегляд (owner/admin, фільтри по actor/resource/date)

### 1.6 Seed Data
- [ ] Скрипт seed.ts: створити базових агентів (CTO, CLAUDE, CODE, QA, PM)
- [ ] Дефолтні SLA rules
- [ ] Тестовий проект "orkwork v2" з задачами

**Результат Phase 1:** Повна CRUD API для всіх core сутностей, audit trail, agent API keys.

---

## Phase 2: Task Engine (тижні 3-4)

### 2.1 Task Lifecycle Engine
- [ ] State machine: CREATED → PLANNING → READY → ASSIGNED → IN_PROGRESS → REVIEW → COMPLETED
- [ ] Валідація переходів (не можна з CREATED в COMPLETED)
- [ ] Автоматичні side-effects (assign → notification, complete → update project progress)
- [ ] POST /api/v2/tasks/:id/transition — зміна стану з валідацією

### 2.2 Auto-Assignment
- [ ] GET /api/v2/agents/available — агенти з вільними слотами
- [ ] POST /api/v2/tasks/:id/assign — авто або manual assign
- [ ] Scoring: capability_match (40%) + workload (20%) + performance (30%) + cost (10%)
- [ ] Fallback: ескалація якщо немає підходящого агента
- [ ] Decision log запис при кожному auto-assign

### 2.3 Task Dependencies (DAG)
- [ ] Валідація: no circular dependencies
- [ ] Auto-ready: задача стає READY коли всі залежності COMPLETED
- [ ] GET /api/v2/tasks/graph — повертає nodes + edges для візуалізації
- [ ] Блокування: не можна починати задачу з незавершеними залежностями

### 2.4 Task Execution Tracking
- [ ] POST /api/v2/tasks/:id/executions — почати виконання (agent reports)
- [ ] PATCH /api/v2/tasks/:id/executions/:eid — оновити статус/прогрес
- [ ] Автоматичний cost tracking (tokens_used, cost_usd, duration)
- [ ] Retry logic: при failure → retry до max_retries

### 2.5 SLA Engine
- [ ] CRUD для SLA rules
- [ ] Background job: перевірка SLA кожні 5 хв (Redis BullMQ)
- [ ] Ескалація по ланцюжку: agent → manager → CEO
- [ ] Нотифікації при SLA breach
- [ ] Dashboard metric: % tasks within SLA

### 2.6 Workflow Engine (базовий)
- [ ] CRUD для workflows
- [ ] POST /api/v2/workflows/:id/run — запустити workflow
- [ ] Створення задач з steps, прокидування залежностей
- [ ] GET /api/v2/workflows/:id/runs — історія запусків
- [ ] Trigger types: manual (поки що), далі schedule/event/webhook

**Результат Phase 2:** Задачі автоматично розподіляються по агентах, DAG залежностей, SLA моніторинг, базові workflows.

---

## Phase 3: Intelligence Engine (тижні 5-6)

### 3.1 Cost Tracking
- [ ] POST /api/v2/costs — запис витрати (agent reports after each LLM call)
- [ ] GET /api/v2/intelligence/costs — breakdown по agent/project/model/period
- [ ] GET /api/v2/intelligence/costs/forecast — прогноз на місяць
- [ ] Budget alerts: коли agent або project наближається до ліміту
- [ ] Daily budget enforcement: block agent якщо перевищено

### 3.2 Performance Scoring
- [ ] Background job: розрахунок score щоденно
- [ ] Metrics: completion rate, avg time, quality, bug rate, cost efficiency
- [ ] GET /api/v2/agents/:id/performance — score + breakdown
- [ ] GET /api/v2/intelligence/leaderboard — рейтинг агентів
- [ ] Historical trends (weekly/monthly)

### 3.3 Daily Brief Generator
- [ ] GET /api/v2/intelligence/brief — згенерувати brief
- [ ] Inputs: overnight activity, overdue tasks, budget status, agent health, decisions pending
- [ ] Format: structured JSON (frontend renders)
- [ ] Optional: LLM summary (Claude Haiku для дешевого генерування)
- [ ] Cron job: генерувати щоранку + push notification

### 3.4 Anomaly Detection
- [ ] Rules engine (не ML поки що):
  - Agent не відповідає > 30 хв при active
  - Token consumption > 3x середнього
  - Повторні failures одного типу
  - Циклічні блокування задач
  - Budget overrun
- [ ] GET /api/v2/intelligence/anomalies — активні аномалії
- [ ] Notifications при виявленні
- [ ] Auto-actions: pause agent, reassign task

### 3.5 Decision Log
- [ ] POST /api/v2/decisions — запис рішення (manual або auto)
- [ ] GET /api/v2/decisions/pending — що чекає на рішення CEO
- [ ] POST /api/v2/decisions/:id/resolve — CEO приймає рішення
- [ ] GET /api/v2/decisions/log — історія з фільтрами
- [ ] Категорії: task_assign, deploy, escalate, approve, budget

### 3.6 Forecasting (базовий)
- [ ] Прогноз завершення проекту (based on velocity)
- [ ] Bottleneck detection: які агенти/tasks блокують найбільше
- [ ] GET /api/v2/intelligence/forecast — predictions

**Результат Phase 3:** CEO бачить повну картину: витрати, performance, аномалії, прогнози. Щоденний brief автоматично.

---

## Phase 4: Agent Runtime (тижні 7-8)

### 4.1 Agent Memory System
- [ ] POST /api/v2/agents/:id/memory — додати memory (fact, preference, lesson, context)
- [ ] GET /api/v2/agents/:id/memory — пошук по relevance (vector similarity)
- [ ] DELETE /api/v2/agents/:id/memory/:mid — видалити
- [ ] OpenAI text-embedding-3-small для embeddings
- [ ] TTL support: auto-expire старих memories
- [ ] Memory consolidation: periodic merge similar memories

### 4.2 Capabilities Registry
- [ ] Structured capabilities: `code:typescript`, `devops:docker`, `qa:automated`, etc.
- [ ] Proficiency tracking: 0.0-1.0, updates based on task outcomes
- [ ] GET /api/v2/capabilities — каталог всіх capabilities в системі
- [ ] GET /api/v2/capabilities/:cap/agents — агенти з цією capability
- [ ] Auto-update proficiency після кожної задачі

### 4.3 Autonomy Levels
- [ ] PATCH /api/v2/agents/:id/autonomy — змінити рівень (owner only)
- [ ] Enforcement middleware: перевіряє дозволи перед кожною дією агента
- [ ] Levels: TOOL (0) → ASSISTANT (1) → SUPERVISED (2) → AUTONOMOUS (3) → STRATEGIC (4)
- [ ] Decision log: обов'язковий при L3+ actions
- [ ] Human-in-the-loop gates: deploy, budget >$10, strategy changes

### 4.4 Agent Health Monitoring
- [ ] Heartbeat endpoint: POST /api/v2/agents/:id/heartbeat
- [ ] Background checker: alert якщо heartbeat missing > threshold
- [ ] Auto-reassign tasks від unhealthy agent
- [ ] GET /api/v2/agents/:id/health — health history
- [ ] Metrics: response time, error rate, uptime %

### 4.5 Tool System (foundation)
- [ ] Tool registry: які tools доступні яким агентам
- [ ] Tool execution logging
- [ ] Tools: git, shell, http_request, db_query, file_ops
- [ ] Permission model: agent X can use tool Y on resource Z

**Результат Phase 4:** Агенти мають пам'ять, capabilities tracking, autonomy enforcement, health monitoring.

---

## Phase 5: Frontend v2 (тижні 9-11)

### 5.1 Setup & Layout
- [ ] Next.js 15 app router в packages/web
- [ ] Tailwind CSS + shadcn/ui компоненти
- [ ] Auth: GitHub OAuth redirect flow (cookie session)
- [ ] Layout: sidebar nav + top bar + main content
- [ ] Dark/light theme
- [ ] Mobile responsive (PWA manifest)

### 5.2 CEO Dashboard (`/dashboard`)
- [ ] System health score (gauge widget)
- [ ] Daily brief panel (rendered from API)
- [ ] Decisions queue (pending approvals)
- [ ] Active agents status (cards)
- [ ] Project health bars
- [ ] Live activity feed (SSE/polling)
- [ ] Quick actions: assign, approve, escalate

### 5.3 Agents Page (`/agents`)
- [ ] Agent cards: name, type, status, current task, performance score
- [ ] Agent detail: config, capabilities, memory, cost history, tasks
- [ ] Create/edit agent modal
- [ ] Autonomy level controls
- [ ] Performance charts (line graph over time)

### 5.4 Projects & Tasks (`/projects`, `/tasks`)
- [ ] Project list with health indicators
- [ ] Project detail: tasks, timeline, budget, team
- [ ] Task board (Kanban): drag-n-drop columns by status
- [ ] Task detail: description, dependencies, executions, comments
- [ ] Task graph visualization (DAG) — use d3.js or reactflow
- [ ] Create/edit task modal with dependency picker

### 5.5 Costs (`/costs`)
- [ ] Total spend: daily/weekly/monthly
- [ ] Breakdown by: agent, project, model
- [ ] Budget vs actual charts
- [ ] Cost per task distribution
- [ ] Forecast chart
- [ ] Budget alerts configuration

### 5.6 Decisions (`/decisions`)
- [ ] Pending decisions list (cards with context + options)
- [ ] One-click approve/deny
- [ ] Decision history with reasoning
- [ ] Filters: type, date, agent

### 5.7 Chat (`/chat`)
- [ ] Channel list (sidebar)
- [ ] Message list with author avatars
- [ ] Send message input
- [ ] WebSocket real-time updates
- [ ] Thread replies
- [ ] File/code sharing (markdown render)
- [ ] Mentions (@agent)
- [ ] Auto-create channel per project

### 5.8 Settings (`/settings`)
- [ ] SLA rules management
- [ ] Agent autonomy config
- [ ] Notification preferences
- [ ] API key management
- [ ] Webhook configuration
- [ ] User management (invite/role)

### 5.9 Workflows (`/workflows`)
- [ ] Workflow list
- [ ] Create workflow (step-by-step form, потім visual builder)
- [ ] Run history
- [ ] Workflow detail: steps visualization

**Результат Phase 5:** Повноцінний web dashboard для CEO з усіма функціями.

---

## Phase 6: Integrations & Real-time (тижні 12-13)

### 6.1 WebSocket / SSE
- [ ] WS endpoint: /api/v2/ws — real-time events
- [ ] Events: task.updated, agent.status, message.new, decision.needed
- [ ] SSE fallback для простіших клієнтів
- [ ] Redis Pub/Sub для broadcasting між інстансами

### 6.2 Notification Engine
- [ ] Smart routing: urgent → push, normal → web, low → digest
- [ ] Channel adapters: web (in-app), email (SendGrid/Resend)
- [ ] Telegram notifications (через існуючий bot)
- [ ] Digest: щоденний email summary
- [ ] User preferences: which channels for which events

### 6.3 Webhook System
- [ ] CRUD для webhooks
- [ ] Event subscription (task.*, agent.*, deploy.*)
- [ ] Retry logic (3 attempts, exponential backoff)
- [ ] Webhook logs (success/failure)
- [ ] Signature verification (HMAC)

### 6.4 GitHub Integration (deep)
- [ ] Auto-create tasks from GitHub issues
- [ ] PR review requests → task assignment
- [ ] Deploy status → task execution tracking
- [ ] Commit activity → agent performance tracking

### 6.5 Background Jobs (BullMQ)
- [ ] SLA checker (every 5 min)
- [ ] Daily brief generator (9:00 AM)
- [ ] Performance score calculator (daily)
- [ ] Anomaly detector (every 15 min)
- [ ] Cost aggregator (hourly)
- [ ] Memory consolidation (weekly)
- [ ] Expired session cleanup (daily)

**Результат Phase 6:** Real-time updates, multi-channel notifications, webhooks, deep GitHub integration.

---

## Phase 7: Polish & Launch (тиждень 14)

### 7.1 Security Audit
- [ ] Penetration testing (основні вектори)
- [ ] SQL injection prevention verification
- [ ] XSS prevention
- [ ] CSRF tokens
- [ ] Rate limiting на всіх endpoints
- [ ] Input validation (Zod schemas на всіх routes)

### 7.2 Performance
- [ ] DB query optimization (EXPLAIN ANALYZE)
- [ ] API response caching (Redis)
- [ ] Frontend: code splitting, lazy loading
- [ ] Image optimization
- [ ] Compression (gzip/brotli)

### 7.3 CI/CD Pipeline
- [ ] GitHub Actions: lint + typecheck + test on PR
- [ ] Auto-deploy to server on push to main
- [ ] Health check after deploy
- [ ] Rollback script

### 7.4 Documentation
- [ ] API docs (OpenAPI/Swagger)
- [ ] Architecture decision records (ADRs)
- [ ] Agent onboarding guide
- [ ] CEO user guide
- [ ] Contributing guide

### 7.5 Monitoring
- [ ] Structured JSON logging
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring (вже є Kuma)
- [ ] Prometheus metrics endpoint
- [ ] Grafana dashboard

**Результат Phase 7:** Production-ready система з CI/CD, моніторингом, документацією.

---

## Пріоритети

```
КРИТИЧНО (must have для launch):
├── Phase 1: Foundation (розширена схема, projects, tasks CRUD)
├── Phase 2: Task Engine (auto-assign, DAG, SLA)
├── Phase 5.1-5.4: Frontend (dashboard, agents, projects, tasks)
└── Phase 7.3: CI/CD

ВАЖЛИВО (потрібно, але можна після launch):
├── Phase 3: Intelligence (costs, briefs, anomalies)
├── Phase 5.5-5.7: Frontend (costs, decisions, chat)
└── Phase 6.1-6.2: WebSocket + Notifications

БАЖАНО (nice to have):
├── Phase 4: Agent Runtime (memory, autonomy, tools)
├── Phase 6.3-6.4: Webhooks + GitHub deep
└── Phase 5.9: Visual workflow builder
```

---

## Тижневий план

| Тиждень | Фокус | Ключові deliverables |
|---------|-------|---------------------|
| 1 | Phase 1a | Розширена БД, Projects CRUD, Tasks CRUD |
| 2 | Phase 1b | API keys, Audit log, Seed data |
| 3 | Phase 2a | Task lifecycle, Auto-assignment, Dependencies |
| 4 | Phase 2b | SLA engine, Workflows, Execution tracking |
| 5 | Phase 3a | Cost tracking, Performance scoring, Daily brief |
| 6 | Phase 3b | Anomaly detection, Decision log, Forecasting |
| 7 | Phase 4a | Agent memory + embeddings, Capabilities registry |
| 8 | Phase 4b | Autonomy enforcement, Health monitoring, Tools |
| 9 | Phase 5a | Next.js setup, Layout, Auth, Dashboard |
| 10 | Phase 5b | Agents page, Projects/Tasks (Kanban + DAG) |
| 11 | Phase 5c | Costs, Decisions, Chat, Settings |
| 12 | Phase 6a | WebSocket, Notifications, Background jobs |
| 13 | Phase 6b | Webhooks, GitHub deep, Telegram notifications |
| 14 | Phase 7 | Security audit, CI/CD, Docs, Monitoring |

---

*Цей план — живий документ. Оновлюється після кожного спринту.*
