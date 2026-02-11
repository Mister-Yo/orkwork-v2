import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { sql, db } from './index';

async function runMigrations() {
  try {
    console.log('🚀 Starting database migration...');

    // Enable pgvector extension first
    console.log('📦 Enabling pgvector extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS vector`;

    // Run Drizzle migrations
    console.log('📋 Running Drizzle migrations...');
    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  runMigrations();
}

export { runMigrations };