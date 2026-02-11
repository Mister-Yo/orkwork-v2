import { sql, db } from './index';
import * as schema from './schema';
import { sql as drizzleSql } from 'drizzle-orm';

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Enable extensions
    console.log('📦 Enabling extensions...');
    await db.execute(drizzleSql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await db.execute(drizzleSql`CREATE EXTENSION IF NOT EXISTS vector`);

    // Create enums
    console.log('📋 Creating enums...');
    const enums = [
      `DO $$ BEGIN CREATE TYPE user_role AS ENUM ('owner','admin','member','viewer'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE agent_status AS ENUM ('active','idle','error','disabled'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE agent_type AS ENUM ('assistant','specialist','researcher','manager'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE task_status AS ENUM ('created','planning','ready','assigned','in_progress','review','completed','blocked','cancelled','rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE priority AS ENUM ('urgent','high','normal','low'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE memory_type AS ENUM ('fact','preference','lesson','context'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE dependency_type AS ENUM ('blocks','soft','related'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE execution_status AS ENUM ('running','success','failed','timeout'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE trigger_type AS ENUM ('manual','schedule','event','webhook'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE workflow_status AS ENUM ('pending','running','completed','failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE recipient_type AS ENUM ('user','agent'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE channel AS ENUM ('web','email','telegram','slack'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE notification_status AS ENUM ('pending','sent','read','failed'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE decision_type AS ENUM ('task_assign','deploy','escalate','approve','budget'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE actor_type AS ENUM ('user','agent','system'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE chat_channel_type AS ENUM ('project','team','direct','general'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE author_type AS ENUM ('user','agent'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE autonomy_level AS ENUM ('tool','assistant','supervised','autonomous','strategic'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE risk_level AS ENUM ('low','medium','high','critical'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    ];
    for (const e of enums) {
      await db.execute(drizzleSql.raw(e));
    }

    // Create tables
    console.log('📋 Creating tables...');

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        github_id INTEGER NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        email VARCHAR(320) UNIQUE,
        role user_role NOT NULL DEFAULT 'viewer',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type agent_type NOT NULL DEFAULT 'assistant',
        model VARCHAR(100) NOT NULL,
        system_prompt TEXT NOT NULL,
        capabilities JSONB DEFAULT '[]',
        status agent_status NOT NULL DEFAULT 'idle',
        config JSONB DEFAULT '{}',
        daily_budget_usd INTEGER,
        total_spent_usd INTEGER DEFAULT 0,
        autonomy_level autonomy_level NOT NULL DEFAULT 'tool',
        max_concurrent_tasks INTEGER NOT NULL DEFAULT 1,
        sla_rule_id UUID,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip VARCHAR(45),
        user_agent TEXT
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'active',
        priority priority NOT NULL DEFAULT 'normal',
        budget INTEGER,
        spent_budget INTEGER DEFAULT 0,
        budget_usd INTEGER,
        spent_usd INTEGER DEFAULT 0,
        deadline TIMESTAMP,
        health_score INTEGER,
        risk_level risk_level NOT NULL DEFAULT 'low',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        status task_status NOT NULL DEFAULT 'created',
        priority priority NOT NULL DEFAULT 'normal',
        estimated_hours INTEGER,
        actual_hours INTEGER,
        due_date TIMESTAMP,
        completed_at TIMESTAMP,
        acceptance_criteria TEXT,
        review_required BOOLEAN NOT NULL DEFAULT FALSE,
        auto_assigned BOOLEAN NOT NULL DEFAULT FALSE,
        retry_count INTEGER NOT NULL DEFAULT 0,
        max_retries INTEGER NOT NULL DEFAULT 3,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS agent_capabilities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        capability VARCHAR(100) NOT NULL,
        proficiency INTEGER NOT NULL DEFAULT 50,
        enabled BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS cost_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        cost_type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        token_count INTEGER,
        model VARCHAR(100),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // New tables for Phase 1a
    console.log('📋 Creating Phase 1a tables...');

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS sla_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        target_type VARCHAR(100) NOT NULL,
        target_value VARCHAR(255) NOT NULL,
        max_response_minutes INTEGER NOT NULL,
        max_resolution_minutes INTEGER NOT NULL,
        escalation_chain JSONB DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS agent_memory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        memory_type memory_type NOT NULL,
        content TEXT NOT NULL,
        embedding TEXT,
        relevance_score INTEGER,
        expires_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS task_dependencies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        dependency_type dependency_type NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS task_executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        status execution_status NOT NULL,
        output TEXT,
        error TEXT,
        tokens_used INTEGER,
        cost_usd INTEGER,
        duration_ms INTEGER
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        steps JSONB NOT NULL,
        trigger_type trigger_type NOT NULL,
        trigger_config JSONB DEFAULT '{}',
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS workflow_runs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
        status workflow_status NOT NULL,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        results JSONB DEFAULT '{}',
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        recipient_type recipient_type NOT NULL,
        recipient_id UUID NOT NULL,
        channel channel NOT NULL,
        priority priority NOT NULL DEFAULT 'normal',
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        status notification_status NOT NULL DEFAULT 'pending',
        sent_at TIMESTAMP,
        read_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS decisions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        decision_type decision_type NOT NULL,
        made_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        context TEXT NOT NULL,
        decision TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        outcome TEXT,
        project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        actor_id UUID NOT NULL,
        actor_type actor_type NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100) NOT NULL,
        resource_id UUID NOT NULL,
        details JSONB DEFAULT '{}',
        ip VARCHAR(45),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS chat_channels (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type chat_channel_type NOT NULL,
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await db.execute(drizzleSql`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
        author_id UUID NOT NULL,
        author_type author_type NOT NULL,
        content TEXT NOT NULL,
        reply_to UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
        attachments JSONB DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    // ALTER existing tables to add new columns (idempotent)
    console.log('📋 Altering existing tables...');
    const alterStatements = [
      // agents new columns
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS daily_budget_usd REAL`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS total_spent_usd REAL DEFAULT 0`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS autonomy_level autonomy_level NOT NULL DEFAULT 'tool'`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS max_concurrent_tasks INTEGER NOT NULL DEFAULT 1`,
      `ALTER TABLE agents ADD COLUMN IF NOT EXISTS sla_rule_id UUID`,
      // tasks new columns
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS acceptance_criteria TEXT`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS review_required BOOLEAN NOT NULL DEFAULT FALSE`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN NOT NULL DEFAULT FALSE`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS max_retries INTEGER NOT NULL DEFAULT 3`,
      // projects new columns
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget_usd REAL`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS spent_usd REAL DEFAULT 0`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS deadline TIMESTAMP`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS health_score REAL`,
      `ALTER TABLE projects ADD COLUMN IF NOT EXISTS risk_level risk_level NOT NULL DEFAULT 'low'`,
    ];
    for (const stmt of alterStatements) {
      await db.execute(drizzleSql.raw(stmt));
    }

    // Add foreign key constraints for new columns
    console.log('📋 Adding foreign key constraints...');
    
    await db.execute(drizzleSql`
      DO $$ 
      BEGIN 
        ALTER TABLE agents ADD CONSTRAINT fk_agents_sla_rule FOREIGN KEY (sla_rule_id) REFERENCES sla_rules(id) ON DELETE SET NULL;
      EXCEPTION 
        WHEN duplicate_object THEN NULL;
      END $$
    `);

    // Create indexes
    console.log('📋 Creating indexes...');
    const indexes = [
      // Existing indexes
      `CREATE INDEX IF NOT EXISTS users_github_id_idx ON users(github_id)`,
      `CREATE INDEX IF NOT EXISTS users_username_idx ON users(username)`,
      `CREATE INDEX IF NOT EXISTS users_email_idx ON users(email)`,
      `CREATE INDEX IF NOT EXISTS agents_name_idx ON agents(name)`,
      `CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status)`,
      `CREATE INDEX IF NOT EXISTS agents_type_idx ON agents(type)`,
      `CREATE INDEX IF NOT EXISTS agents_autonomy_level_idx ON agents(autonomy_level)`,
      `CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash)`,
      `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)`,
      `CREATE INDEX IF NOT EXISTS projects_name_idx ON projects(name)`,
      `CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status)`,
      `CREATE INDEX IF NOT EXISTS projects_risk_level_idx ON projects(risk_level)`,
      `CREATE INDEX IF NOT EXISTS projects_deadline_idx ON projects(deadline)`,
      `CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id)`,
      `CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON tasks(assignee_id)`,
      `CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status)`,
      `CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority)`,
      `CREATE INDEX IF NOT EXISTS tasks_auto_assigned_idx ON tasks(auto_assigned)`,
      `CREATE INDEX IF NOT EXISTS agent_capabilities_agent_id_idx ON agent_capabilities(agent_id)`,
      `CREATE INDEX IF NOT EXISTS cost_entries_agent_id_idx ON cost_entries(agent_id)`,
      `CREATE INDEX IF NOT EXISTS cost_entries_created_at_idx ON cost_entries(created_at)`,
      
      // New Phase 1a indexes
      `CREATE INDEX IF NOT EXISTS sla_rules_name_idx ON sla_rules(name)`,
      `CREATE INDEX IF NOT EXISTS sla_rules_is_active_idx ON sla_rules(is_active)`,
      `CREATE INDEX IF NOT EXISTS agent_memory_agent_id_idx ON agent_memory(agent_id)`,
      `CREATE INDEX IF NOT EXISTS agent_memory_type_idx ON agent_memory(memory_type)`,
      `CREATE INDEX IF NOT EXISTS agent_memory_expires_at_idx ON agent_memory(expires_at)`,
      `CREATE INDEX IF NOT EXISTS task_dependencies_task_id_idx ON task_dependencies(task_id)`,
      `CREATE INDEX IF NOT EXISTS task_dependencies_depends_on_idx ON task_dependencies(depends_on_task_id)`,
      `CREATE INDEX IF NOT EXISTS task_dependencies_unique_idx ON task_dependencies(task_id, depends_on_task_id)`,
      `CREATE INDEX IF NOT EXISTS task_executions_task_id_idx ON task_executions(task_id)`,
      `CREATE INDEX IF NOT EXISTS task_executions_agent_id_idx ON task_executions(agent_id)`,
      `CREATE INDEX IF NOT EXISTS task_executions_status_idx ON task_executions(status)`,
      `CREATE INDEX IF NOT EXISTS task_executions_started_at_idx ON task_executions(started_at)`,
      `CREATE INDEX IF NOT EXISTS workflows_name_idx ON workflows(name)`,
      `CREATE INDEX IF NOT EXISTS workflows_created_by_idx ON workflows(created_by)`,
      `CREATE INDEX IF NOT EXISTS workflows_is_active_idx ON workflows(is_active)`,
      `CREATE INDEX IF NOT EXISTS workflows_trigger_type_idx ON workflows(trigger_type)`,
      `CREATE INDEX IF NOT EXISTS workflow_runs_workflow_id_idx ON workflow_runs(workflow_id)`,
      `CREATE INDEX IF NOT EXISTS workflow_runs_status_idx ON workflow_runs(status)`,
      `CREATE INDEX IF NOT EXISTS workflow_runs_started_at_idx ON workflow_runs(started_at)`,
      `CREATE INDEX IF NOT EXISTS notifications_recipient_idx ON notifications(recipient_type, recipient_id)`,
      `CREATE INDEX IF NOT EXISTS notifications_status_idx ON notifications(status)`,
      `CREATE INDEX IF NOT EXISTS notifications_channel_idx ON notifications(channel)`,
      `CREATE INDEX IF NOT EXISTS notifications_priority_idx ON notifications(priority)`,
      `CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON notifications(created_at)`,
      `CREATE INDEX IF NOT EXISTS decisions_type_idx ON decisions(decision_type)`,
      `CREATE INDEX IF NOT EXISTS decisions_made_by_idx ON decisions(made_by)`,
      `CREATE INDEX IF NOT EXISTS decisions_project_id_idx ON decisions(project_id)`,
      `CREATE INDEX IF NOT EXISTS decisions_task_id_idx ON decisions(task_id)`,
      `CREATE INDEX IF NOT EXISTS decisions_created_at_idx ON decisions(created_at)`,
      `CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON audit_log(actor_type, actor_id)`,
      `CREATE INDEX IF NOT EXISTS audit_log_action_idx ON audit_log(action)`,
      `CREATE INDEX IF NOT EXISTS audit_log_resource_idx ON audit_log(resource_type, resource_id)`,
      `CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log(created_at)`,
      `CREATE INDEX IF NOT EXISTS chat_channels_name_idx ON chat_channels(name)`,
      `CREATE INDEX IF NOT EXISTS chat_channels_type_idx ON chat_channels(type)`,
      `CREATE INDEX IF NOT EXISTS chat_channels_project_id_idx ON chat_channels(project_id)`,
      `CREATE INDEX IF NOT EXISTS chat_channels_created_by_idx ON chat_channels(created_by)`,
      `CREATE INDEX IF NOT EXISTS chat_messages_channel_id_idx ON chat_messages(channel_id)`,
      `CREATE INDEX IF NOT EXISTS chat_messages_author_idx ON chat_messages(author_type, author_id)`,
      `CREATE INDEX IF NOT EXISTS chat_messages_reply_to_idx ON chat_messages(reply_to)`,
      `CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON chat_messages(created_at)`,
    ];
    for (const idx of indexes) {
      await db.execute(drizzleSql.raw(idx));
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

if (import.meta.main) {
  runMigrations();
}

export { runMigrations };
