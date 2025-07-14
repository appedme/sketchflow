import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'sqlite',
  // For local development, we'll use a local SQLite file
  // In production, this will be configured for D1
  dbCredentials: {
    url: './dev.db',
  },
});