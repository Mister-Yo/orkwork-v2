"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentToolsRelations = exports.agentCapabilitiesRelations = exports.tasksRelations = exports.projectsRelations = exports.sessionsRelations = exports.agentsRelations = exports.usersRelations = exports.webhookLogs = exports.webhooks = exports.apiKeys = exports.chatMessages = exports.chatChannels = exports.auditLog = exports.decisions = exports.notifications = exports.workflowRuns = exports.workflows = exports.slaRules = exports.taskExecutions = exports.taskDependencies = exports.agentMemory = exports.costEntries = exports.agentTools = exports.agentCapabilities = exports.tasks = exports.projects = exports.sessions = exports.agents = exports.users = exports.toolTypeEnum = exports.riskLevelEnum = exports.autonomyLevelEnum = exports.authorTypeEnum = exports.chatChannelTypeEnum = exports.actorTypeEnum = exports.decisionTypeEnum = exports.notificationStatusEnum = exports.channelEnum = exports.recipientTypeEnum = exports.workflowStatusEnum = exports.triggerTypeEnum = exports.executionStatusEnum = exports.dependencyTypeEnum = exports.memoryTypeEnum = exports.priorityEnum = exports.taskStatusEnum = exports.agentTypeEnum = exports.agentStatusEnum = exports.userRoleEnum = exports.enablePgVector = void 0;
exports.webhookLogsRelations = exports.webhooksRelations = exports.apiKeysRelations = exports.chatMessagesRelations = exports.chatChannelsRelations = exports.decisionsRelations = exports.slaRulesRelations = exports.workflowRunsRelations = exports.workflowsRelations = exports.taskExecutionsRelations = exports.taskDependenciesRelations = exports.agentMemoryRelations = exports.costEntriesRelations = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
// Extensions
exports.enablePgVector = `CREATE EXTENSION IF NOT EXISTS vector`;
// Enums
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['owner', 'admin', 'member', 'viewer']);
exports.agentStatusEnum = (0, pg_core_1.pgEnum)('agent_status', ['active', 'idle', 'error', 'disabled']);
exports.agentTypeEnum = (0, pg_core_1.pgEnum)('agent_type', ['assistant', 'specialist', 'researcher', 'manager']);
exports.taskStatusEnum = (0, pg_core_1.pgEnum)('task_status', ['created', 'planning', 'ready', 'assigned', 'in_progress', 'review', 'completed', 'blocked', 'cancelled', 'rejected']);
exports.priorityEnum = (0, pg_core_1.pgEnum)('priority', ['urgent', 'high', 'normal', 'low']);
exports.memoryTypeEnum = (0, pg_core_1.pgEnum)('memory_type', ['fact', 'preference', 'lesson', 'context']);
exports.dependencyTypeEnum = (0, pg_core_1.pgEnum)('dependency_type', ['blocks', 'soft', 'related']);
exports.executionStatusEnum = (0, pg_core_1.pgEnum)('execution_status', ['running', 'success', 'failed', 'timeout']);
exports.triggerTypeEnum = (0, pg_core_1.pgEnum)('trigger_type', ['manual', 'schedule', 'event', 'webhook']);
exports.workflowStatusEnum = (0, pg_core_1.pgEnum)('workflow_status', ['pending', 'running', 'completed', 'failed']);
exports.recipientTypeEnum = (0, pg_core_1.pgEnum)('recipient_type', ['user', 'agent']);
exports.channelEnum = (0, pg_core_1.pgEnum)('channel', ['web', 'email', 'telegram', 'slack']);
exports.notificationStatusEnum = (0, pg_core_1.pgEnum)('notification_status', ['pending', 'sent', 'read', 'failed']);
exports.decisionTypeEnum = (0, pg_core_1.pgEnum)('decision_type', ['task_assign', 'deploy', 'escalate', 'approve', 'budget']);
exports.actorTypeEnum = (0, pg_core_1.pgEnum)('actor_type', ['user', 'agent', 'system']);
exports.chatChannelTypeEnum = (0, pg_core_1.pgEnum)('chat_channel_type', ['project', 'team', 'direct', 'general']);
exports.authorTypeEnum = (0, pg_core_1.pgEnum)('author_type', ['user', 'agent']);
exports.autonomyLevelEnum = (0, pg_core_1.pgEnum)('autonomy_level', ['tool', 'assistant', 'supervised', 'autonomous', 'strategic']);
exports.riskLevelEnum = (0, pg_core_1.pgEnum)('risk_level', ['low', 'medium', 'high', 'critical']);
exports.toolTypeEnum = (0, pg_core_1.pgEnum)('tool_type', ['git', 'shell', 'http', 'db_query', 'file_ops', 'browser', 'custom']);
// Core tables
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    githubId: (0, pg_core_1.integer)('github_id').notNull().unique(),
    username: (0, pg_core_1.varchar)('username', { length: 255 }).notNull().unique(),
    displayName: (0, pg_core_1.varchar)('display_name', { length: 255 }).notNull(),
    avatarUrl: (0, pg_core_1.text)('avatar_url'),
    email: (0, pg_core_1.varchar)('email', { length: 320 }).unique(),
    role: (0, exports.userRoleEnum)('role').notNull().default('viewer'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    githubIdIdx: (0, pg_core_1.index)('users_github_id_idx').on(table.githubId),
    usernameIdx: (0, pg_core_1.index)('users_username_idx').on(table.username),
    emailIdx: (0, pg_core_1.index)('users_email_idx').on(table.email),
}));
exports.agents = (0, pg_core_1.pgTable)('agents', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, exports.agentTypeEnum)('type').notNull().default('assistant'),
    model: (0, pg_core_1.varchar)('model', { length: 100 }).notNull(),
    systemPrompt: (0, pg_core_1.text)('system_prompt').notNull(),
    capabilities: (0, pg_core_1.jsonb)('capabilities').$type().default([]),
    status: (0, exports.agentStatusEnum)('status').notNull().default('idle'),
    config: (0, pg_core_1.jsonb)('config').$type().default({}),
    dailyBudgetUsd: (0, pg_core_1.integer)('daily_budget_usd'), // in cents
    totalSpentUsd: (0, pg_core_1.integer)('total_spent_usd').default(0), // in cents
    autonomyLevel: (0, exports.autonomyLevelEnum)('autonomy_level').notNull().default('tool'),
    maxConcurrentTasks: (0, pg_core_1.integer)('max_concurrent_tasks').notNull().default(1),
    slaRuleId: (0, pg_core_1.uuid)('sla_rule_id'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('agents_name_idx').on(table.name),
    statusIdx: (0, pg_core_1.index)('agents_status_idx').on(table.status),
    typeIdx: (0, pg_core_1.index)('agents_type_idx').on(table.type),
    autonomyLevelIdx: (0, pg_core_1.index)('agents_autonomy_level_idx').on(table.autonomyLevel),
}));
exports.sessions = (0, pg_core_1.pgTable)('sessions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    tokenHash: (0, pg_core_1.varchar)('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hash
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    ip: (0, pg_core_1.varchar)('ip', { length: 45 }), // IPv6 compatible
    userAgent: (0, pg_core_1.text)('user_agent'),
}, (table) => ({
    tokenHashIdx: (0, pg_core_1.index)('sessions_token_hash_idx').on(table.tokenHash),
    userIdIdx: (0, pg_core_1.index)('sessions_user_id_idx').on(table.userId),
    expiresAtIdx: (0, pg_core_1.index)('sessions_expires_at_idx').on(table.expiresAt),
}));
exports.projects = (0, pg_core_1.pgTable)('projects', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.varchar)('status', { length: 50 }).notNull().default('active'),
    priority: (0, exports.priorityEnum)('priority').notNull().default('normal'),
    budget: (0, pg_core_1.integer)('budget'), // in cents
    spentBudget: (0, pg_core_1.integer)('spent_budget').default(0),
    budgetUsd: (0, pg_core_1.integer)('budget_usd'), // in cents
    spentUsd: (0, pg_core_1.integer)('spent_usd').default(0), // in cents
    deadline: (0, pg_core_1.timestamp)('deadline'),
    healthScore: (0, pg_core_1.integer)('health_score'), // 0-100
    riskLevel: (0, exports.riskLevelEnum)('risk_level').notNull().default('low'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('projects_name_idx').on(table.name),
    statusIdx: (0, pg_core_1.index)('projects_status_idx').on(table.status),
    priorityIdx: (0, pg_core_1.index)('projects_priority_idx').on(table.priority),
    riskLevelIdx: (0, pg_core_1.index)('projects_risk_level_idx').on(table.riskLevel),
    deadlineIdx: (0, pg_core_1.index)('projects_deadline_idx').on(table.deadline),
}));
exports.tasks = (0, pg_core_1.pgTable)('tasks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    projectId: (0, pg_core_1.uuid)('project_id').notNull().references(() => exports.projects.id, { onDelete: 'cascade' }),
    assigneeId: (0, pg_core_1.uuid)('assignee_id').references(() => exports.users.id, { onDelete: 'set null' }),
    title: (0, pg_core_1.varchar)('title', { length: 500 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, exports.taskStatusEnum)('status').notNull().default('created'),
    priority: (0, exports.priorityEnum)('priority').notNull().default('normal'),
    estimatedHours: (0, pg_core_1.integer)('estimated_hours'),
    actualHours: (0, pg_core_1.integer)('actual_hours'),
    dueDate: (0, pg_core_1.timestamp)('due_date'),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    acceptanceCriteria: (0, pg_core_1.text)('acceptance_criteria'),
    reviewRequired: (0, pg_core_1.boolean)('review_required').notNull().default(false),
    autoAssigned: (0, pg_core_1.boolean)('auto_assigned').notNull().default(false),
    retryCount: (0, pg_core_1.integer)('retry_count').notNull().default(0),
    maxRetries: (0, pg_core_1.integer)('max_retries').notNull().default(3),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    projectIdIdx: (0, pg_core_1.index)('tasks_project_id_idx').on(table.projectId),
    assigneeIdIdx: (0, pg_core_1.index)('tasks_assignee_id_idx').on(table.assigneeId),
    statusIdx: (0, pg_core_1.index)('tasks_status_idx').on(table.status),
    priorityIdx: (0, pg_core_1.index)('tasks_priority_idx').on(table.priority),
    dueDateIdx: (0, pg_core_1.index)('tasks_due_date_idx').on(table.dueDate),
    autoAssignedIdx: (0, pg_core_1.index)('tasks_auto_assigned_idx').on(table.autoAssigned),
}));
exports.agentCapabilities = (0, pg_core_1.pgTable)('agent_capabilities', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    agentId: (0, pg_core_1.uuid)('agent_id').notNull().references(() => exports.agents.id, { onDelete: 'cascade' }),
    capability: (0, pg_core_1.varchar)('capability', { length: 100 }).notNull(),
    proficiency: (0, pg_core_1.integer)('proficiency').notNull().default(50), // 0-100
    enabled: (0, pg_core_1.boolean)('enabled').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    agentIdIdx: (0, pg_core_1.index)('agent_capabilities_agent_id_idx').on(table.agentId),
    capabilityIdx: (0, pg_core_1.index)('agent_capabilities_capability_idx').on(table.capability),
}));
exports.agentTools = (0, pg_core_1.pgTable)('agent_tools', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    agentId: (0, pg_core_1.uuid)('agent_id').notNull().references(() => exports.agents.id, { onDelete: 'cascade' }),
    toolName: (0, pg_core_1.varchar)('tool_name', { length: 100 }).notNull(),
    toolType: (0, exports.toolTypeEnum)('tool_type').notNull(),
    description: (0, pg_core_1.text)('description'),
    config: (0, pg_core_1.jsonb)('config').$type().default({}),
    isEnabled: (0, pg_core_1.boolean)('is_enabled').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    agentIdIdx: (0, pg_core_1.index)('agent_tools_agent_id_idx').on(table.agentId),
    toolNameIdx: (0, pg_core_1.index)('agent_tools_tool_name_idx').on(table.toolName),
    toolTypeIdx: (0, pg_core_1.index)('agent_tools_tool_type_idx').on(table.toolType),
    isEnabledIdx: (0, pg_core_1.index)('agent_tools_is_enabled_idx').on(table.isEnabled),
}));
exports.costEntries = (0, pg_core_1.pgTable)('cost_entries', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    agentId: (0, pg_core_1.uuid)('agent_id').references(() => exports.agents.id, { onDelete: 'cascade' }),
    taskId: (0, pg_core_1.uuid)('task_id').references(() => exports.tasks.id, { onDelete: 'cascade' }),
    costType: (0, pg_core_1.varchar)('cost_type', { length: 50 }).notNull(), // api_tokens, compute, storage
    amount: (0, pg_core_1.integer)('amount').notNull(), // in cents
    tokenCount: (0, pg_core_1.integer)('token_count'),
    model: (0, pg_core_1.varchar)('model', { length: 100 }),
    metadata: (0, pg_core_1.jsonb)('metadata').$type().default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    agentIdIdx: (0, pg_core_1.index)('cost_entries_agent_id_idx').on(table.agentId),
    taskIdIdx: (0, pg_core_1.index)('cost_entries_task_id_idx').on(table.taskId),
    costTypeIdx: (0, pg_core_1.index)('cost_entries_cost_type_idx').on(table.costType),
    createdAtIdx: (0, pg_core_1.index)('cost_entries_created_at_idx').on(table.createdAt),
}));
// New tables for Phase 1a
exports.agentMemory = (0, pg_core_1.pgTable)('agent_memory', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    agentId: (0, pg_core_1.uuid)('agent_id').notNull().references(() => exports.agents.id, { onDelete: 'cascade' }),
    memoryType: (0, exports.memoryTypeEnum)('memory_type').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    embedding: (0, pg_core_1.text)('embedding'), // vector(1536) - stored as text for now
    relevanceScore: (0, pg_core_1.integer)('relevance_score'), // 0-100
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    agentIdIdx: (0, pg_core_1.index)('agent_memory_agent_id_idx').on(table.agentId),
    memoryTypeIdx: (0, pg_core_1.index)('agent_memory_type_idx').on(table.memoryType),
    expiresAtIdx: (0, pg_core_1.index)('agent_memory_expires_at_idx').on(table.expiresAt),
}));
exports.taskDependencies = (0, pg_core_1.pgTable)('task_dependencies', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    taskId: (0, pg_core_1.uuid)('task_id').notNull().references(() => exports.tasks.id, { onDelete: 'cascade' }),
    dependsOnTaskId: (0, pg_core_1.uuid)('depends_on_task_id').notNull().references(() => exports.tasks.id, { onDelete: 'cascade' }),
    dependencyType: (0, exports.dependencyTypeEnum)('dependency_type').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    taskIdIdx: (0, pg_core_1.index)('task_dependencies_task_id_idx').on(table.taskId),
    dependsOnIdIdx: (0, pg_core_1.index)('task_dependencies_depends_on_idx').on(table.dependsOnTaskId),
    uniqueDependency: (0, pg_core_1.index)('task_dependencies_unique_idx').on(table.taskId, table.dependsOnTaskId),
}));
exports.taskExecutions = (0, pg_core_1.pgTable)('task_executions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    taskId: (0, pg_core_1.uuid)('task_id').notNull().references(() => exports.tasks.id, { onDelete: 'cascade' }),
    agentId: (0, pg_core_1.uuid)('agent_id').notNull().references(() => exports.agents.id, { onDelete: 'cascade' }),
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    status: (0, exports.executionStatusEnum)('status').notNull(),
    output: (0, pg_core_1.text)('output'),
    error: (0, pg_core_1.text)('error'),
    tokensUsed: (0, pg_core_1.integer)('tokens_used'),
    costUsd: (0, pg_core_1.integer)('cost_usd'), // in cents
    durationMs: (0, pg_core_1.integer)('duration_ms'),
}, (table) => ({
    taskIdIdx: (0, pg_core_1.index)('task_executions_task_id_idx').on(table.taskId),
    agentIdIdx: (0, pg_core_1.index)('task_executions_agent_id_idx').on(table.agentId),
    statusIdx: (0, pg_core_1.index)('task_executions_status_idx').on(table.status),
    startedAtIdx: (0, pg_core_1.index)('task_executions_started_at_idx').on(table.startedAt),
}));
exports.slaRules = (0, pg_core_1.pgTable)('sla_rules', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    targetType: (0, pg_core_1.varchar)('target_type', { length: 100 }).notNull(),
    targetValue: (0, pg_core_1.varchar)('target_value', { length: 255 }).notNull(),
    maxResponseMinutes: (0, pg_core_1.integer)('max_response_minutes').notNull(),
    maxResolutionMinutes: (0, pg_core_1.integer)('max_resolution_minutes').notNull(),
    escalationChain: (0, pg_core_1.jsonb)('escalation_chain').$type().default({}),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('sla_rules_name_idx').on(table.name),
    isActiveIdx: (0, pg_core_1.index)('sla_rules_is_active_idx').on(table.isActive),
}));
exports.workflows = (0, pg_core_1.pgTable)('workflows', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    description: (0, pg_core_1.text)('description'),
    steps: (0, pg_core_1.jsonb)('steps').$type().notNull(),
    triggerType: (0, exports.triggerTypeEnum)('trigger_type').notNull(),
    triggerConfig: (0, pg_core_1.jsonb)('trigger_config').$type().default({}),
    createdBy: (0, pg_core_1.uuid)('created_by').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('workflows_name_idx').on(table.name),
    createdByIdx: (0, pg_core_1.index)('workflows_created_by_idx').on(table.createdBy),
    isActiveIdx: (0, pg_core_1.index)('workflows_is_active_idx').on(table.isActive),
    triggerTypeIdx: (0, pg_core_1.index)('workflows_trigger_type_idx').on(table.triggerType),
}));
exports.workflowRuns = (0, pg_core_1.pgTable)('workflow_runs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    workflowId: (0, pg_core_1.uuid)('workflow_id').notNull().references(() => exports.workflows.id, { onDelete: 'cascade' }),
    status: (0, exports.workflowStatusEnum)('status').notNull(),
    startedAt: (0, pg_core_1.timestamp)('started_at').defaultNow().notNull(),
    completedAt: (0, pg_core_1.timestamp)('completed_at'),
    results: (0, pg_core_1.jsonb)('results').$type().default({}),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    workflowIdIdx: (0, pg_core_1.index)('workflow_runs_workflow_id_idx').on(table.workflowId),
    statusIdx: (0, pg_core_1.index)('workflow_runs_status_idx').on(table.status),
    startedAtIdx: (0, pg_core_1.index)('workflow_runs_started_at_idx').on(table.startedAt),
}));
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    recipientType: (0, exports.recipientTypeEnum)('recipient_type').notNull(),
    recipientId: (0, pg_core_1.uuid)('recipient_id').notNull(),
    channel: (0, exports.channelEnum)('channel').notNull(),
    priority: (0, exports.priorityEnum)('priority').notNull().default('normal'),
    title: (0, pg_core_1.varchar)('title', { length: 255 }).notNull(),
    body: (0, pg_core_1.text)('body').notNull(),
    metadata: (0, pg_core_1.jsonb)('metadata').$type().default({}),
    status: (0, exports.notificationStatusEnum)('status').notNull().default('pending'),
    sentAt: (0, pg_core_1.timestamp)('sent_at'),
    readAt: (0, pg_core_1.timestamp)('read_at'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    recipientIdx: (0, pg_core_1.index)('notifications_recipient_idx').on(table.recipientType, table.recipientId),
    statusIdx: (0, pg_core_1.index)('notifications_status_idx').on(table.status),
    channelIdx: (0, pg_core_1.index)('notifications_channel_idx').on(table.channel),
    priorityIdx: (0, pg_core_1.index)('notifications_priority_idx').on(table.priority),
    createdAtIdx: (0, pg_core_1.index)('notifications_created_at_idx').on(table.createdAt),
}));
exports.decisions = (0, pg_core_1.pgTable)('decisions', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    decisionType: (0, exports.decisionTypeEnum)('decision_type').notNull(),
    madeBy: (0, pg_core_1.uuid)('made_by').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    context: (0, pg_core_1.text)('context').notNull(),
    decision: (0, pg_core_1.text)('decision').notNull(),
    reasoning: (0, pg_core_1.text)('reasoning').notNull(),
    outcome: (0, pg_core_1.text)('outcome'),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => exports.projects.id, { onDelete: 'set null' }),
    taskId: (0, pg_core_1.uuid)('task_id').references(() => exports.tasks.id, { onDelete: 'set null' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    decisionTypeIdx: (0, pg_core_1.index)('decisions_type_idx').on(table.decisionType),
    madeByIdx: (0, pg_core_1.index)('decisions_made_by_idx').on(table.madeBy),
    projectIdIdx: (0, pg_core_1.index)('decisions_project_id_idx').on(table.projectId),
    taskIdIdx: (0, pg_core_1.index)('decisions_task_id_idx').on(table.taskId),
    createdAtIdx: (0, pg_core_1.index)('decisions_created_at_idx').on(table.createdAt),
}));
exports.auditLog = (0, pg_core_1.pgTable)('audit_log', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    actorId: (0, pg_core_1.uuid)('actor_id').notNull(),
    actorType: (0, exports.actorTypeEnum)('actor_type').notNull(),
    action: (0, pg_core_1.varchar)('action', { length: 100 }).notNull(),
    resourceType: (0, pg_core_1.varchar)('resource_type', { length: 100 }).notNull(),
    resourceId: (0, pg_core_1.uuid)('resource_id').notNull(),
    details: (0, pg_core_1.jsonb)('details').$type().default({}),
    ip: (0, pg_core_1.varchar)('ip', { length: 45 }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    actorIdx: (0, pg_core_1.index)('audit_log_actor_idx').on(table.actorType, table.actorId),
    actionIdx: (0, pg_core_1.index)('audit_log_action_idx').on(table.action),
    resourceIdx: (0, pg_core_1.index)('audit_log_resource_idx').on(table.resourceType, table.resourceId),
    createdAtIdx: (0, pg_core_1.index)('audit_log_created_at_idx').on(table.createdAt),
}));
exports.chatChannels = (0, pg_core_1.pgTable)('chat_channels', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    type: (0, exports.chatChannelTypeEnum)('type').notNull(),
    projectId: (0, pg_core_1.uuid)('project_id').references(() => exports.projects.id, { onDelete: 'cascade' }),
    createdBy: (0, pg_core_1.uuid)('created_by').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)('chat_channels_name_idx').on(table.name),
    typeIdx: (0, pg_core_1.index)('chat_channels_type_idx').on(table.type),
    projectIdIdx: (0, pg_core_1.index)('chat_channels_project_id_idx').on(table.projectId),
    createdByIdx: (0, pg_core_1.index)('chat_channels_created_by_idx').on(table.createdBy),
}));
exports.chatMessages = (0, pg_core_1.pgTable)('chat_messages', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    channelId: (0, pg_core_1.uuid)('channel_id').notNull().references(() => exports.chatChannels.id, { onDelete: 'cascade' }),
    authorId: (0, pg_core_1.uuid)('author_id').notNull(),
    authorType: (0, exports.authorTypeEnum)('author_type').notNull(),
    content: (0, pg_core_1.text)('content').notNull(),
    replyTo: (0, pg_core_1.uuid)('reply_to').references(() => exports.chatMessages.id, { onDelete: 'set null' }),
    attachments: (0, pg_core_1.jsonb)('attachments').$type().default([]),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
}, (table) => ({
    channelIdIdx: (0, pg_core_1.index)('chat_messages_channel_id_idx').on(table.channelId),
    authorIdx: (0, pg_core_1.index)('chat_messages_author_idx').on(table.authorType, table.authorId),
    replyToIdx: (0, pg_core_1.index)('chat_messages_reply_to_idx').on(table.replyTo),
    createdAtIdx: (0, pg_core_1.index)('chat_messages_created_at_idx').on(table.createdAt),
}));
exports.apiKeys = (0, pg_core_1.pgTable)('api_keys', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    agentId: (0, pg_core_1.uuid)('agent_id').notNull().references(() => exports.agents.id, { onDelete: 'cascade' }),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    keyHash: (0, pg_core_1.varchar)('key_hash', { length: 64 }).notNull().unique(),
    keyPrefix: (0, pg_core_1.varchar)('key_prefix', { length: 8 }).notNull(),
    scopes: (0, pg_core_1.text)('scopes').array().notNull().default([]),
    expiresAt: (0, pg_core_1.timestamp)('expires_at'),
    lastUsedAt: (0, pg_core_1.timestamp)('last_used_at'),
    createdBy: (0, pg_core_1.uuid)('created_by').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    agentIdIdx: (0, pg_core_1.index)('api_keys_agent_id_idx').on(table.agentId),
    keyHashIdx: (0, pg_core_1.index)('api_keys_key_hash_idx').on(table.keyHash),
    keyPrefixIdx: (0, pg_core_1.index)('api_keys_key_prefix_idx').on(table.keyPrefix),
    isActiveIdx: (0, pg_core_1.index)('api_keys_is_active_idx').on(table.isActive),
    createdByIdx: (0, pg_core_1.index)('api_keys_created_by_idx').on(table.createdBy),
    expiresAtIdx: (0, pg_core_1.index)('api_keys_expires_at_idx').on(table.expiresAt),
}));
exports.webhooks = (0, pg_core_1.pgTable)('webhooks', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    url: (0, pg_core_1.text)('url').notNull(),
    events: (0, pg_core_1.text)('events').array().notNull().default([]),
    secret: (0, pg_core_1.varchar)('secret', { length: 64 }).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdBy: (0, pg_core_1.uuid)('created_by').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    description: (0, pg_core_1.text)('description'),
    lastTriggeredAt: (0, pg_core_1.timestamp)('last_triggered_at'),
    failureCount: (0, pg_core_1.integer)('failure_count').notNull().default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    urlIdx: (0, pg_core_1.index)('webhooks_url_idx').on(table.url),
    isActiveIdx: (0, pg_core_1.index)('webhooks_is_active_idx').on(table.isActive),
    createdByIdx: (0, pg_core_1.index)('webhooks_created_by_idx').on(table.createdBy),
    lastTriggeredAtIdx: (0, pg_core_1.index)('webhooks_last_triggered_at_idx').on(table.lastTriggeredAt),
}));
exports.webhookLogs = (0, pg_core_1.pgTable)('webhook_logs', {
    id: (0, pg_core_1.uuid)('id').primaryKey().defaultRandom(),
    webhookId: (0, pg_core_1.uuid)('webhook_id').notNull().references(() => exports.webhooks.id, { onDelete: 'cascade' }),
    eventType: (0, pg_core_1.varchar)('event_type', { length: 100 }).notNull(),
    payload: (0, pg_core_1.jsonb)('payload').$type().notNull(),
    responseStatus: (0, pg_core_1.integer)('response_status'),
    responseBody: (0, pg_core_1.text)('response_body'),
    durationMs: (0, pg_core_1.integer)('duration_ms'),
    success: (0, pg_core_1.boolean)('success').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => ({
    webhookIdIdx: (0, pg_core_1.index)('webhook_logs_webhook_id_idx').on(table.webhookId),
    eventTypeIdx: (0, pg_core_1.index)('webhook_logs_event_type_idx').on(table.eventType),
    successIdx: (0, pg_core_1.index)('webhook_logs_success_idx').on(table.success),
    createdAtIdx: (0, pg_core_1.index)('webhook_logs_created_at_idx').on(table.createdAt),
}));
// Relations
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    sessions: many(exports.sessions),
    assignedTasks: many(exports.tasks, { relationName: 'assignee' }),
}));
exports.agentsRelations = (0, drizzle_orm_1.relations)(exports.agents, ({ one, many }) => ({
    capabilities: many(exports.agentCapabilities),
    tools: many(exports.agentTools),
    costEntries: many(exports.costEntries),
    memory: many(exports.agentMemory),
    executions: many(exports.taskExecutions),
    apiKeys: many(exports.apiKeys),
    slaRule: one(exports.slaRules, {
        fields: [exports.agents.slaRuleId],
        references: [exports.slaRules.id],
    }),
}));
exports.sessionsRelations = (0, drizzle_orm_1.relations)(exports.sessions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.sessions.userId],
        references: [exports.users.id],
    }),
}));
exports.projectsRelations = (0, drizzle_orm_1.relations)(exports.projects, ({ many }) => ({
    tasks: many(exports.tasks),
}));
exports.tasksRelations = (0, drizzle_orm_1.relations)(exports.tasks, ({ one, many }) => ({
    project: one(exports.projects, {
        fields: [exports.tasks.projectId],
        references: [exports.projects.id],
    }),
    assignee: one(exports.users, {
        fields: [exports.tasks.assigneeId],
        references: [exports.users.id],
        relationName: 'assignee',
    }),
    costEntries: many(exports.costEntries),
    dependencies: many(exports.taskDependencies, { relationName: 'dependencies' }),
    dependentTasks: many(exports.taskDependencies, { relationName: 'dependentTasks' }),
    executions: many(exports.taskExecutions),
    decisions: many(exports.decisions),
}));
exports.agentCapabilitiesRelations = (0, drizzle_orm_1.relations)(exports.agentCapabilities, ({ one }) => ({
    agent: one(exports.agents, {
        fields: [exports.agentCapabilities.agentId],
        references: [exports.agents.id],
    }),
}));
exports.agentToolsRelations = (0, drizzle_orm_1.relations)(exports.agentTools, ({ one }) => ({
    agent: one(exports.agents, {
        fields: [exports.agentTools.agentId],
        references: [exports.agents.id],
    }),
}));
exports.costEntriesRelations = (0, drizzle_orm_1.relations)(exports.costEntries, ({ one }) => ({
    agent: one(exports.agents, {
        fields: [exports.costEntries.agentId],
        references: [exports.agents.id],
    }),
    task: one(exports.tasks, {
        fields: [exports.costEntries.taskId],
        references: [exports.tasks.id],
    }),
}));
// New relations for Phase 1a tables
exports.agentMemoryRelations = (0, drizzle_orm_1.relations)(exports.agentMemory, ({ one }) => ({
    agent: one(exports.agents, {
        fields: [exports.agentMemory.agentId],
        references: [exports.agents.id],
    }),
}));
exports.taskDependenciesRelations = (0, drizzle_orm_1.relations)(exports.taskDependencies, ({ one }) => ({
    task: one(exports.tasks, {
        fields: [exports.taskDependencies.taskId],
        references: [exports.tasks.id],
        relationName: 'dependencies',
    }),
    dependsOnTask: one(exports.tasks, {
        fields: [exports.taskDependencies.dependsOnTaskId],
        references: [exports.tasks.id],
        relationName: 'dependentTasks',
    }),
}));
exports.taskExecutionsRelations = (0, drizzle_orm_1.relations)(exports.taskExecutions, ({ one }) => ({
    task: one(exports.tasks, {
        fields: [exports.taskExecutions.taskId],
        references: [exports.tasks.id],
    }),
    agent: one(exports.agents, {
        fields: [exports.taskExecutions.agentId],
        references: [exports.agents.id],
    }),
}));
exports.workflowsRelations = (0, drizzle_orm_1.relations)(exports.workflows, ({ one, many }) => ({
    createdBy: one(exports.users, {
        fields: [exports.workflows.createdBy],
        references: [exports.users.id],
    }),
    runs: many(exports.workflowRuns),
}));
exports.workflowRunsRelations = (0, drizzle_orm_1.relations)(exports.workflowRuns, ({ one }) => ({
    workflow: one(exports.workflows, {
        fields: [exports.workflowRuns.workflowId],
        references: [exports.workflows.id],
    }),
}));
exports.slaRulesRelations = (0, drizzle_orm_1.relations)(exports.slaRules, ({ many }) => ({
    agents: many(exports.agents),
}));
exports.decisionsRelations = (0, drizzle_orm_1.relations)(exports.decisions, ({ one }) => ({
    madeBy: one(exports.users, {
        fields: [exports.decisions.madeBy],
        references: [exports.users.id],
    }),
    project: one(exports.projects, {
        fields: [exports.decisions.projectId],
        references: [exports.projects.id],
    }),
    task: one(exports.tasks, {
        fields: [exports.decisions.taskId],
        references: [exports.tasks.id],
    }),
}));
exports.chatChannelsRelations = (0, drizzle_orm_1.relations)(exports.chatChannels, ({ one, many }) => ({
    project: one(exports.projects, {
        fields: [exports.chatChannels.projectId],
        references: [exports.projects.id],
    }),
    createdBy: one(exports.users, {
        fields: [exports.chatChannels.createdBy],
        references: [exports.users.id],
    }),
    messages: many(exports.chatMessages),
}));
exports.chatMessagesRelations = (0, drizzle_orm_1.relations)(exports.chatMessages, ({ one }) => ({
    channel: one(exports.chatChannels, {
        fields: [exports.chatMessages.channelId],
        references: [exports.chatChannels.id],
    }),
    replyTo: one(exports.chatMessages, {
        fields: [exports.chatMessages.replyTo],
        references: [exports.chatMessages.id],
        relationName: 'replies',
    }),
}));
exports.apiKeysRelations = (0, drizzle_orm_1.relations)(exports.apiKeys, ({ one }) => ({
    agent: one(exports.agents, {
        fields: [exports.apiKeys.agentId],
        references: [exports.agents.id],
    }),
    createdBy: one(exports.users, {
        fields: [exports.apiKeys.createdBy],
        references: [exports.users.id],
    }),
}));
exports.webhooksRelations = (0, drizzle_orm_1.relations)(exports.webhooks, ({ one, many }) => ({
    createdBy: one(exports.users, {
        fields: [exports.webhooks.createdBy],
        references: [exports.users.id],
    }),
    logs: many(exports.webhookLogs),
}));
exports.webhookLogsRelations = (0, drizzle_orm_1.relations)(exports.webhookLogs, ({ one }) => ({
    webhook: one(exports.webhooks, {
        fields: [exports.webhookLogs.webhookId],
        references: [exports.webhooks.id],
    }),
}));
