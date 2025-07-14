import { migrate } from 'drizzle-orm/d1/migrator';
import { createDb } from './index';

export async function runMigrations(d1Database: D1Database) {
  const db = createDb(d1Database);
  
  try {
    await migrate(db, { migrationsFolder: './src/lib/db/migrations' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}