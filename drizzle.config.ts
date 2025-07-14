import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './src/lib/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './.wrangler/state/v3/d1/miniflare-D1DatabaseObject/f6e48957e47f012c5c5a65bf21adff6c119aa6eac319e7567f29f68cc1e4a8c2.sqlite',
  },
});