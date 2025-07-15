import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

// Database connection for Turso
export function getDb() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error('TURSO_DATABASE_URL is not set');
  }

  if (!authToken) {
    throw new Error('TURSO_AUTH_TOKEN is not set');
  }

  const client = createClient({
    url,
    authToken,
  });

  return drizzle(client, { schema });
}

// Type for our database instance
export type Database = ReturnType<typeof getDb>;