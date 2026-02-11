import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, pgEnum, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Extensions
export const enablePgVector = `CREATE EXTENSION IF NOT EXISTS vector`;

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member', 'pending', 'viewer']);
export const agentStatusEnum = pgEnum('agent_status', ['active', 'idle', 'error', 'disabled']);
export const agentTypeEnum = pgEnum('agent_type', ['assistant', 'specialist', 'researcher', 'manager']);
export const taskStatusEnum = pgEnum('task_status', ['created', 'planning', 'ready', 'assigned', 'in_progress', 'review', 'completed', 'blocked', 'cancelled', 'rejected']);
export const priorityEnum = pgEnum('priority', ['urgent', 'high', 'normal', 'low']);
export const memoryTypeEnum = pgEnum('memory_type', ['fact', 'preference', 'lesson', 'context']);
export const dependencyTypeEnum = pgEnum('dependency_type', ['blocks', 'soft', 'related']);
export const executionStatusEnum = pgEnum('execution_status', ['running', 'success', 'failed', 'timeout']);
export const triggerTypeEnum = pgEnum('trigger_type', ['manual', 'schedule', 'event', 'webhook']);
export const workflowStatusEnum = pgEnum('workflow_status', ['pending', 'running', 'completed', 'failed']);
export const recipientTypeEnum = pgEnum('recipient_type', ['user', 'agent']);
export const channelEnum = pgEnum('channel', ['web', 'email', 'telegram', 'slack']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'read', 'failed']);
export const decisionTypeEnum = pgEnum('decision_type', ['task_assign', 'deploy', 'escalate', 'approve', 'budget']);
export const actorTypeEnum = pgEnum('actor_type', ['user', 'agent', 'system']);
export const chatChannelTypeEnum = pgEnum('chat_channel_type', ['project', 'team', 'direct', 'general']);
export const authorTypeEnum = pgEnum('author_type', ['user', 'agent']);
export const autonomyLevelEnum = pgEnum('autonomy_level', ['tool', 'assistant', 'supervised', 'autonomous', 'strategic']);
export const riskLevelEnum = pgEnum('risk_level', ['low', 'medium', 'high', 'critical']);
export const toolTypeEnum = pgEnum('tool_type', ['git', 'shell', 'http', 'db_query', 'file_ops', 'browser', 'custom']);

// Core tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: integer('github_id').notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  email: varchar('email', { length: 320 }).unique(),
  role: userRoleEnum('role').notNull().default('pending'),
  title: varchar("title", { length: 255 }),
  department: varchar("department", { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  githubIdIdx: index('users_github_id_idx').on(table.githubId),
  usernameIdx: index('users_username_idx').on(table.username),
  emailIdx: index('users_email_idx').on(table.email),
}));

export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: agentTypeEnum('type').notNull().default('assistant'),
  model: varchar('model', { length: 100 }).notNull(),
  systemPrompt: text('system_prompt').notNull(),
  capabilities: jsonb('capabilities').$type<string[]>().default([]),
  status: agentStatusEnum('status').notNull().default('idle'),
  config: jsonb('config').$type<Record<string, any>>().default({}),
  dailyBudgetUsd: integer('daily_budget_usd'),  // in cents
  totalSpentUsd: integer('total_spent_usd').default(0),  // in cents
  autonomyLevel: autonomyLevelEnum('autonomy_level').notNull().default('tool'),
  maxConcurrentTasks: integer('max_concurrent_tasks').notNull().default(1),
  department: varchar("department", { length: 100 }),
  reportsTo: uuid("reports_to").references(() => agents.id, { onDelete: "set null" }),
  slaRuleId: uuid('sla_rule_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('agents_name_idx').on(table.name),
  statusIdx: index('agents_status_idx').on(table.status),
  typeIdx: index('agents_type_idx').on(table.type),
  autonomyLevelIdx: index('agents_autonomy_level_idx').on(table.autonomyLevel),
}));

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hash
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  ip: varchar('ip', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
}, (table) => ({
  tokenHashIdx: index('sessions_token_hash_idx').on(table.tokenHash),
  userIdIdx: index('sessions_user_id_idx').on(table.userId),
  expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
}));

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  priority: priorityEnum('priority').notNull().default('normal'),
  budget: integer('budget'), // in cents
  spentBudget: integer('spent_budget').default(0),
  budgetUsd: integer('budget_usd'),  // in cents
  spentUsd: integer('spent_usd').default(0),  // in cents
  deadline: timestamp('deadline'),
  healthScore: integer('health_score'),  // 0-100
  riskLevel: riskLevelEnum('risk_level').notNull().default('low'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('projects_name_idx').on(table.name),
  statusIdx: index('projects_status_idx').on(table.status),
  priorityIdx: index('projects_priority_idx').on(table.priority),
  riskLevelIdx: index('projects_risk_level_idx').on(table.riskLevel),
  deadlineIdx: index('projects_deadline_idx').on(table.deadline),
}));

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 500 }).notNull(),
  description: text('description'),
  status: taskStatusEnum('status').notNull().default('created'),
  priority: priorityEnum('priority').notNull().default('normal'),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  acceptanceCriteria: text('acceptance_criteria'),
  reviewRequired: boolean('review_required').notNull().default(false),
  autoAssigned: boolean('auto_assigned').notNull().default(false),
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index('tasks_project_id_idx').on(table.projectId),
  assigneeIdIdx: index('tasks_assignee_id_idx').on(table.assigneeId),
  statusIdx: index('tasks_status_idx').on(table.status),
  priorityIdx: index('tasks_priority_idx').on(table.priority),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
  autoAssignedIdx: index('tasks_auto_assigned_idx').on(table.autoAssigned),
}));

export const agentCapabilities = pgTable('agent_capabilities', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  capability: varchar('capability', { length: 100 }).notNull(),
  proficiency: integer('proficiency').notNull().default(50), // 0-100
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  agentIdIdx: index('agent_capabilities_agent_id_idx').on(table.agentId),
  capabilityIdx: index('agent_capabilities_capability_idx').on(table.capability),
}));

export const agentTools = pgTable('agent_tools', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  toolName: varchar('tool_name', { length: 100 }).notNull(),
  toolType: toolTypeEnum('tool_type').notNull(),
  description: text('description'),
  config: jsonb('config').$type<Record<string, any>>().default({}),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  agentIdIdx: index('agent_tools_agent_id_idx').on(table.agentId),
  toolNameIdx: index('agent_tools_tool_name_idx').on(table.toolName),
  toolTypeIdx: index('agent_tools_tool_type_idx').on(table.toolType),
  isEnabledIdx: index('agent_tools_is_enabled_idx').on(table.isEnabled),
}));

export const costEntries = pgTable('cost_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'cascade' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
  costType: varchar('cost_type', { length: 50 }).notNull(), // api_tokens, compute, storage
  amount: integer('amount').notNull(), // in cents
  tokenCount: integer('token_count'),
  model: varchar('model', { length: 100 }),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  agentIdIdx: index('cost_entries_agent_id_idx').on(table.agentId),
  taskIdIdx: index('cost_entries_task_id_idx').on(table.taskId),
  costTypeIdx: index('cost_entries_cost_type_idx').on(table.costType),
  createdAtIdx: index('cost_entries_created_at_idx').on(table.createdAt),
}));

// New tables for Phase 1a
export const agentMemory = pgTable('agent_memory', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  memoryType: memoryTypeEnum('memory_type').notNull(),
  content: text('content').notNull(),
  embedding: text('embedding'), // vector(1536) - stored as text for now
  relevanceScore: integer('relevance_score'),  // 0-100
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  agentIdIdx: index('agent_memory_agent_id_idx').on(table.agentId),
  memoryTypeIdx: index('agent_memory_type_idx').on(table.memoryType),
  expiresAtIdx: index('agent_memory_expires_at_idx').on(table.expiresAt),
}));

export const taskDependencies = pgTable('task_dependencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  dependsOnTaskId: uuid('depends_on_task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  dependencyType: dependencyTypeEnum('dependency_type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  taskIdIdx: index('task_dependencies_task_id_idx').on(table.taskId),
  dependsOnIdIdx: index('task_dependencies_depends_on_idx').on(table.dependsOnTaskId),
  uniqueDependency: index('task_dependencies_unique_idx').on(table.taskId, table.dependsOnTaskId),
}));

export const taskExecutions = pgTable('task_executions', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  status: executionStatusEnum('status').notNull(),
  output: text('output'),
  error: text('error'),
  tokensUsed: integer('tokens_used'),
  costUsd: integer('cost_usd'),  // in cents
  durationMs: integer('duration_ms'),
}, (table) => ({
  taskIdIdx: index('task_executions_task_id_idx').on(table.taskId),
  agentIdIdx: index('task_executions_agent_id_idx').on(table.agentId),
  statusIdx: index('task_executions_status_idx').on(table.status),
  startedAtIdx: index('task_executions_started_at_idx').on(table.startedAt),
}));

export const slaRules = pgTable('sla_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  targetType: varchar('target_type', { length: 100 }).notNull(),
  targetValue: varchar('target_value', { length: 255 }).notNull(),
  maxResponseMinutes: integer('max_response_minutes').notNull(),
  maxResolutionMinutes: integer('max_resolution_minutes').notNull(),
  escalationChain: jsonb('escalation_chain').$type<Record<string, any>>().default({}),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('sla_rules_name_idx').on(table.name),
  isActiveIdx: index('sla_rules_is_active_idx').on(table.isActive),
}));

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  steps: jsonb('steps').$type<Record<string, any>[]>().notNull(),
  triggerType: triggerTypeEnum('trigger_type').notNull(),
  triggerConfig: jsonb('trigger_config').$type<Record<string, any>>().default({}),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('workflows_name_idx').on(table.name),
  createdByIdx: index('workflows_created_by_idx').on(table.createdBy),
  isActiveIdx: index('workflows_is_active_idx').on(table.isActive),
  triggerTypeIdx: index('workflows_trigger_type_idx').on(table.triggerType),
}));

export const workflowRuns = pgTable('workflow_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').notNull().references(() => workflows.id, { onDelete: 'cascade' }),
  status: workflowStatusEnum('status').notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  results: jsonb('results').$type<Record<string, any>>().default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workflowIdIdx: index('workflow_runs_workflow_id_idx').on(table.workflowId),
  statusIdx: index('workflow_runs_status_idx').on(table.status),
  startedAtIdx: index('workflow_runs_started_at_idx').on(table.startedAt),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientType: recipientTypeEnum('recipient_type').notNull(),
  recipientId: uuid('recipient_id').notNull(),
  channel: channelEnum('channel').notNull(),
  priority: priorityEnum('priority').notNull().default('normal'),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>().default({}),
  status: notificationStatusEnum('status').notNull().default('pending'),
  sentAt: timestamp('sent_at'),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  recipientIdx: index('notifications_recipient_idx').on(table.recipientType, table.recipientId),
  statusIdx: index('notifications_status_idx').on(table.status),
  channelIdx: index('notifications_channel_idx').on(table.channel),
  priorityIdx: index('notifications_priority_idx').on(table.priority),
  createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
}));

export const decisions = pgTable('decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  decisionType: decisionTypeEnum('decision_type').notNull(),
  madeBy: uuid('made_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  context: text('context').notNull(),
  decision: text('decision').notNull(),
  reasoning: text('reasoning').notNull(),
  outcome: text('outcome'),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
  taskId: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  decisionTypeIdx: index('decisions_type_idx').on(table.decisionType),
  madeByIdx: index('decisions_made_by_idx').on(table.madeBy),
  projectIdIdx: index('decisions_project_id_idx').on(table.projectId),
  taskIdIdx: index('decisions_task_id_idx').on(table.taskId),
  createdAtIdx: index('decisions_created_at_idx').on(table.createdAt),
}));

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').notNull(),
  actorType: actorTypeEnum('actor_type').notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  resourceType: varchar('resource_type', { length: 100 }).notNull(),
  resourceId: uuid('resource_id').notNull(),
  details: jsonb('details').$type<Record<string, any>>().default({}),
  ip: varchar('ip', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  actorIdx: index('audit_log_actor_idx').on(table.actorType, table.actorId),
  actionIdx: index('audit_log_action_idx').on(table.action),
  resourceIdx: index('audit_log_resource_idx').on(table.resourceType, table.resourceId),
  createdAtIdx: index('audit_log_created_at_idx').on(table.createdAt),
}));

export const chatChannels = pgTable('chat_channels', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  type: chatChannelTypeEnum('type').notNull(),
  projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('chat_channels_name_idx').on(table.name),
  typeIdx: index('chat_channels_type_idx').on(table.type),
  projectIdIdx: index('chat_channels_project_id_idx').on(table.projectId),
  createdByIdx: index('chat_channels_created_by_idx').on(table.createdBy),
}));

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  channelId: uuid('channel_id').notNull().references(() => chatChannels.id, { onDelete: 'cascade' }),
  authorId: uuid('author_id').notNull(),
  authorType: authorTypeEnum('author_type').notNull(),
  content: text('content').notNull(),
  replyTo: uuid('reply_to').references(() => chatMessages.id, { onDelete: 'set null' }),
  attachments: jsonb('attachments').$type<Record<string, any>[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  channelIdIdx: index('chat_messages_channel_id_idx').on(table.channelId),
  authorIdx: index('chat_messages_author_idx').on(table.authorType, table.authorId),
  replyToIdx: index('chat_messages_reply_to_idx').on(table.replyTo),
  createdAtIdx: index('chat_messages_created_at_idx').on(table.createdAt),
}));

export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 64 }).notNull().unique(),
  keyPrefix: varchar('key_prefix', { length: 8 }).notNull(),
  scopes: text('scopes').array().notNull().default([]),
  expiresAt: timestamp('expires_at'),
  lastUsedAt: timestamp('last_used_at'),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  agentIdIdx: index('api_keys_agent_id_idx').on(table.agentId),
  keyHashIdx: index('api_keys_key_hash_idx').on(table.keyHash),
  keyPrefixIdx: index('api_keys_key_prefix_idx').on(table.keyPrefix),
  isActiveIdx: index('api_keys_is_active_idx').on(table.isActive),
  createdByIdx: index('api_keys_created_by_idx').on(table.createdBy),
  expiresAtIdx: index('api_keys_expires_at_idx').on(table.expiresAt),
}));

export const webhooks = pgTable('webhooks', {
  id: uuid('id').primaryKey().defaultRandom(),
  url: text('url').notNull(),
  events: text('events').array().notNull().default([]),
  secret: varchar('secret', { length: 64 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: uuid('created_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  description: text('description'),
  lastTriggeredAt: timestamp('last_triggered_at'),
  failureCount: integer('failure_count').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  urlIdx: index('webhooks_url_idx').on(table.url),
  isActiveIdx: index('webhooks_is_active_idx').on(table.isActive),
  createdByIdx: index('webhooks_created_by_idx').on(table.createdBy),
  lastTriggeredAtIdx: index('webhooks_last_triggered_at_idx').on(table.lastTriggeredAt),
}));

export const webhookLogs = pgTable('webhook_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  webhookId: uuid('webhook_id').notNull().references(() => webhooks.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').$type<Record<string, any>>().notNull(),
  responseStatus: integer('response_status'),
  responseBody: text('response_body'),
  durationMs: integer('duration_ms'),
  success: boolean('success').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  webhookIdIdx: index('webhook_logs_webhook_id_idx').on(table.webhookId),
  eventTypeIdx: index('webhook_logs_event_type_idx').on(table.eventType),
  successIdx: index('webhook_logs_success_idx').on(table.success),
  createdAtIdx: index('webhook_logs_created_at_idx').on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  assignedTasks: many(tasks, { relationName: 'assignee' }),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  capabilities: many(agentCapabilities),
  tools: many(agentTools),
  costEntries: many(costEntries),
  memory: many(agentMemory),
  executions: many(taskExecutions),
  apiKeys: many(apiKeys),
  slaRule: one(slaRules, {
    fields: [agents.slaRuleId],
    references: [slaRules.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [tasks.assigneeId],
    references: [users.id],
    relationName: 'assignee',
  }),
  costEntries: many(costEntries),
  dependencies: many(taskDependencies, { relationName: 'dependencies' }),
  dependentTasks: many(taskDependencies, { relationName: 'dependentTasks' }),
  executions: many(taskExecutions),
  decisions: many(decisions),
}));

export const agentCapabilitiesRelations = relations(agentCapabilities, ({ one }) => ({
  agent: one(agents, {
    fields: [agentCapabilities.agentId],
    references: [agents.id],
  }),
}));

export const agentToolsRelations = relations(agentTools, ({ one }) => ({
  agent: one(agents, {
    fields: [agentTools.agentId],
    references: [agents.id],
  }),
}));

export const costEntriesRelations = relations(costEntries, ({ one }) => ({
  agent: one(agents, {
    fields: [costEntries.agentId],
    references: [agents.id],
  }),
  task: one(tasks, {
    fields: [costEntries.taskId],
    references: [tasks.id],
  }),
}));

// New relations for Phase 1a tables
export const agentMemoryRelations = relations(agentMemory, ({ one }) => ({
  agent: one(agents, {
    fields: [agentMemory.agentId],
    references: [agents.id],
  }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task: one(tasks, {
    fields: [taskDependencies.taskId],
    references: [tasks.id],
    relationName: 'dependencies',
  }),
  dependsOnTask: one(tasks, {
    fields: [taskDependencies.dependsOnTaskId],
    references: [tasks.id],
    relationName: 'dependentTasks',
  }),
}));

export const taskExecutionsRelations = relations(taskExecutions, ({ one }) => ({
  task: one(tasks, {
    fields: [taskExecutions.taskId],
    references: [tasks.id],
  }),
  agent: one(agents, {
    fields: [taskExecutions.agentId],
    references: [agents.id],
  }),
}));

export const workflowsRelations = relations(workflows, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [workflows.createdBy],
    references: [users.id],
  }),
  runs: many(workflowRuns),
}));

export const workflowRunsRelations = relations(workflowRuns, ({ one }) => ({
  workflow: one(workflows, {
    fields: [workflowRuns.workflowId],
    references: [workflows.id],
  }),
}));

export const slaRulesRelations = relations(slaRules, ({ many }) => ({
  agents: many(agents),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  madeBy: one(users, {
    fields: [decisions.madeBy],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [decisions.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [decisions.taskId],
    references: [tasks.id],
  }),
}));

export const chatChannelsRelations = relations(chatChannels, ({ one, many }) => ({
  project: one(projects, {
    fields: [chatChannels.projectId],
    references: [projects.id],
  }),
  createdBy: one(users, {
    fields: [chatChannels.createdBy],
    references: [users.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  channel: one(chatChannels, {
    fields: [chatMessages.channelId],
    references: [chatChannels.id],
  }),
  replyTo: one(chatMessages, {
    fields: [chatMessages.replyTo],
    references: [chatMessages.id],
    relationName: 'replies',
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  agent: one(agents, {
    fields: [apiKeys.agentId],
    references: [agents.id],
  }),
  createdBy: one(users, {
    fields: [apiKeys.createdBy],
    references: [users.id],
  }),
}));

export const webhooksRelations = relations(webhooks, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [webhooks.createdBy],
    references: [users.id],
  }),
  logs: many(webhookLogs),
}));

export const webhookLogsRelations = relations(webhookLogs, ({ one }) => ({
  webhook: one(webhooks, {
    fields: [webhookLogs.webhookId],
    references: [webhooks.id],
  }),
}));

// Types for use in application
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type AgentCapability = typeof agentCapabilities.$inferSelect;
export type NewAgentCapability = typeof agentCapabilities.$inferInsert;
export type AgentTool = typeof agentTools.$inferSelect;
export type NewAgentTool = typeof agentTools.$inferInsert;
export type CostEntry = typeof costEntries.$inferSelect;
export type NewCostEntry = typeof costEntries.$inferInsert;

// New types for Phase 1a
export type AgentMemory = typeof agentMemory.$inferSelect;
export type NewAgentMemory = typeof agentMemory.$inferInsert;
export type TaskDependency = typeof taskDependencies.$inferSelect;
export type NewTaskDependency = typeof taskDependencies.$inferInsert;
export type TaskExecution = typeof taskExecutions.$inferSelect;
export type NewTaskExecution = typeof taskExecutions.$inferInsert;
export type Workflow = typeof workflows.$inferSelect;
export type NewWorkflow = typeof workflows.$inferInsert;
export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type Decision = typeof decisions.$inferSelect;
export type NewDecision = typeof decisions.$inferInsert;
export type SlaRule = typeof slaRules.$inferSelect;
export type NewSlaRule = typeof slaRules.$inferInsert;
export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
export type ChatChannel = typeof chatChannels.$inferSelect;
export type NewChatChannel = typeof chatChannels.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;
export type Webhook = typeof webhooks.$inferSelect;
export type NewWebhook = typeof webhooks.$inferInsert;
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type NewWebhookLog = typeof webhookLogs.$inferInsert;