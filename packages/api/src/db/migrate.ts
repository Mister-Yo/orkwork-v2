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
      `DO $$ BEGIN CREATE TYPE task_status AS ENUM ('created','ready','assigned','in_progress','completed','blocked','cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
      `DO $$ BEGIN CREATE TYPE priority AS ENUM ('urgent','high','normal','low'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
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

    // Create indexes
    console.log('📋 Creating indexes...');
    const indexes = [
      `CREATE INDEX IF NOT EXISTS users_github_id_idx ON users(github_id)`,
      `CREATE INDEX IF NOT EXISTS users_username_idx ON users(username)`,
      `CREATE INDEX IF NOT EXISTS users_email_idx ON users(email)`,
      `CREATE INDEX IF NOT EXISTS agents_name_idx ON agents(name)`,
      `CREATE INDEX IF NOT EXISTS agents_status_idx ON agents(status)`,
      `CREATE INDEX IF NOT EXISTS agents_type_idx ON agents(type)`,
      `CREATE INDEX IF NOT EXISTS sessions_token_hash_idx ON sessions(token_hash)`,
      `CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id)`,
      `CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at)`,
      `CREATE INDEX IF NOT EXISTS projects_name_idx ON projects(name)`,
      `CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status)`,
      `CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id)`,
      `CREATE INDEX IF NOT EXISTS tasks_assignee_id_idx ON tasks(assignee_id)`,
      `CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status)`,
      `CREATE INDEX IF NOT EXISTS tasks_priority_idx ON tasks(priority)`,
      `CREATE INDEX IF NOT EXISTS agent_capabilities_agent_id_idx ON agent_capabilities(agent_id)`,
      `CREATE INDEX IF NOT EXISTS cost_entries_agent_id_idx ON cost_entries(agent_id)`,
      `CREATE INDEX IF NOT EXISTS cost_entries_created_at_idx ON cost_entries(created_at)`,
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
