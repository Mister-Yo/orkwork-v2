import { pgTable, uuid, text, timestamp, jsonb, boolean, integer, pgEnum, varchar, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Extensions
export const enablePgVector = `CREATE EXTENSION IF NOT EXISTS vector`;

// Enums
export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'member', 'viewer']);
export const agentStatusEnum = pgEnum('agent_status', ['active', 'idle', 'error', 'disabled']);
export const agentTypeEnum = pgEnum('agent_type', ['assistant', 'specialist', 'researcher', 'manager']);
export const taskStatusEnum = pgEnum('task_status', ['created', 'ready', 'assigned', 'in_progress', 'completed', 'blocked', 'cancelled']);
export const priorityEnum = pgEnum('priority', ['urgent', 'high', 'normal', 'low']);

// Core tables
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  githubId: integer('github_id').notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  email: varchar('email', { length: 320 }).unique(),
  role: userRoleEnum('role').notNull().default('viewer'),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('agents_name_idx').on(table.name),
  statusIdx: index('agents_status_idx').on(table.status),
  typeIdx: index('agents_type_idx').on(table.type),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  nameIdx: index('projects_name_idx').on(table.name),
  statusIdx: index('projects_status_idx').on(table.status),
  priorityIdx: index('projects_priority_idx').on(table.priority),
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
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  projectIdIdx: index('tasks_project_id_idx').on(table.projectId),
  assigneeIdIdx: index('tasks_assignee_id_idx').on(table.assigneeId),
  statusIdx: index('tasks_status_idx').on(table.status),
  priorityIdx: index('tasks_priority_idx').on(table.priority),
  dueDateIdx: index('tasks_due_date_idx').on(table.dueDate),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  assignedTasks: many(tasks, { relationName: 'assignee' }),
}));

export const agentsRelations = relations(agents, ({ many }) => ({
  capabilities: many(agentCapabilities),
  costEntries: many(costEntries),
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
}));

export const agentCapabilitiesRelations = relations(agentCapabilities, ({ one }) => ({
  agent: one(agents, {
    fields: [agentCapabilities.agentId],
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
export type CostEntry = typeof costEntries.$inferSelect;
export type NewCostEntry = typeof costEntries.$inferInsert;