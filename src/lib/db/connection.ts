import { drizzle } from 'drizzle-orm/d1';
import { drizzle as drizzleBetter } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// Database connection for Cloudflare Workers/Pages
export function getDb() {
  // In Cloudflare Workers/Pages environment
  if (typeof globalThis !== 'undefined' && 'DB' in globalThis) {
    return drizzle(globalThis.DB as D1Database, { schema });
  }
  
  // For development with wrangler dev
  if (typeof process !== 'undefined' && process.env.DB) {
    return drizzle(process.env.DB as any, { schema });
  }
  
  // For Next.js development - use local SQLite
  if (process.env.NODE_ENV === 'development') {
    try {
      // Use the most recent database file
      const dbFiles = require('fs').readdirSync('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/').filter((f: string) => f.endsWith('.sqlite'));
      const dbPath = `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/${dbFiles[0]}`;
      const sqlite = new Database(dbPath);
      return drizzleBetter(sqlite, { schema });
    } catch (error) {
      console.warn('Local D1 database not found, trying alternative path');
      try {
        const sqlite = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/e7352547963de7050bd7d94658afc4fe78b61811b7815da12d90be8e863abf4d.sqlite');
        return drizzleBetter(sqlite, { schema });
      } catch (error2) {
        console.warn('No local D1 database found, creating in-memory database');
        const sqlite = new Database(':memory:');
        return drizzleBetter(sqlite, { schema });
      }
    }
  }
  
  throw new Error('Database not available. Make sure D1 binding is configured.');
}

// Type for our database instance
export type Database = ReturnType<typeof getDb>;