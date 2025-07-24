import { drizzle } from 'drizzle-orm/d1';
import * as schema from './schema';

// This will be used in development and production
export function createDb(d1Database: D1Database) {
  return drizzle(d1Database, { schema });
}

// Type for our database instance
export type Database = ReturnType<typeof createDb>;

// For server actions and API routes
export function getDb(): Database {
  // In production, this will come from the Cloudflare Workers environment
  // For now, we'll set it up to work with the development environment
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    // Check if we have Turso credentials for development
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;

    if (tursoUrl && tursoToken) {
      // Use Turso connection in development if available
      try {
        const { getDb: getTursoDb } = require('./connection');
        return getTursoDb();
      } catch (error) {
        console.warn('Failed to connect to Turso in development:', error);
      }
    }

    // Development setup - will be configured when we set up local D1
    throw new Error('Database not configured for development. Please run wrangler d1 create first.');
  }

  // This will be replaced with actual D1 binding in production
  throw new Error('Database binding not available');
}