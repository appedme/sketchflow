import { drizzle } from 'drizzle-orm/d1';
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
  
  throw new Error('Database not available. Make sure D1 binding is configured.');
}

// Type for our database instance
export type Database = ReturnType<typeof getDb>;