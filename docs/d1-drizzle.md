# Cloudflare D1 + Drizzle ORM Setup Guide

This guide explains how to set up Cloudflare D1 database with Drizzle ORM in a Next.js application deployed on Cloudflare Workers.

## 📋 Prerequisites

- Node.js 18+ installed
- Cloudflare account
- Wrangler CLI installed globally: `npm install -g wrangler`
- Basic knowledge of Next.js and SQL

## 🚀 Quick Start

### 1. Project Setup

```bash
# Create a new Next.js project
npx create-next-app@latest my-d1-app
cd my-d1-app

# Install required dependencies
npm install drizzle-orm drizzle-kit @opennextjs/cloudflare better-sqlite3 wrangler
```

### 2. Cloudflare D1 Database Setup

```bash
# Login to Cloudflare (if not already logged in)
wrangler login

# Create a new D1 database
wrangler d1 create my-database-name

# This will output something like:
# [[d1_databases]]
# binding = "DB"
# database_name = "my-database-name" 
# database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 3. Wrangler Configuration

Create or update `wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "your-app-name",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": [
    "nodejs_compat",
    "global_fetch_strictly_public"
  ],
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-database-name",
      "database_id": "your-database-id-from-step-2",
      "migrations_dir": "./drizzle"
    }
  ]
}
```

### 4. Drizzle Configuration

Create `drizzle.config.js`:

```javascript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/lib/schema.js",
  out: "./drizzle",
  driver: "d1-http",
  dbCredentials: {
    wranglerConfigPath: "./wrangler.jsonc",
    dbName: "my-database-name",
  },
});
```

### 5. Database Schema

Create `src/lib/schema.js`:

```javascript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const notes = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
```

### 6. Database Connection

Create `src/lib/db.js`:

```javascript
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema.js";

export function getDB() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB, { schema });
}
```

### 7. Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "wrangler d1 migrations apply my-database-name --local",
    "db:migrate:prod": "wrangler d1 migrations apply my-database-name --remote",
    "db:status": "wrangler d1 migrations status my-database-name",
    "db:create": "wrangler d1 create my-database-name"
  }
}
```

### 8. OpenNext Configuration

Create `open-next.config.ts`:

```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Add any custom configuration here
});
```

## 🔄 Database Operations

### Generate and Apply Migrations

```bash
# Generate migration files from schema changes
npm run db:generate

# Apply migrations to local development database
npm run db:migrate

# Apply migrations to production database
npm run db:migrate:prod
```

### Example API Route

Create `src/app/api/notes/route.js`:

```javascript
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";
import { notes } from "@/lib/schema";
import { desc } from "drizzle-orm";

// GET all notes
export async function GET() {
  try {
    const db = getDB();
    const allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt));
    return NextResponse.json(allNotes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

// POST new note
export async function POST(request) {
  try {
    const { title, content } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const db = getDB();
    const newNote = await db.insert(notes).values({
      title,
      content,
    }).returning();

    return NextResponse.json(newNote[0], { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json({ error: "Failed to create note" }, { status: 500 });
  }
}
```

## 🚀 Deployment

### Development

```bash
# Start local development server
npm run dev
```

### Production

```bash
# Deploy to Cloudflare Workers
npm run deploy
```

## 🔧 Common Drizzle Operations

### Select Operations

```javascript
import { eq, and, or, gt, lt, like } from "drizzle-orm";

// Get all records
const allNotes = await db.select().from(notes);

// Get with conditions
const note = await db.select().from(notes).where(eq(notes.id, 1));

// Get with multiple conditions
const recentNotes = await db.select()
  .from(notes)
  .where(and(
    gt(notes.createdAt, new Date('2025-01-01')),
    like(notes.title, '%important%')
  ));

// Limit and offset
const paginatedNotes = await db.select()
  .from(notes)
  .limit(10)
  .offset(20);
```

### Insert Operations

```javascript
// Insert single record
const newNote = await db.insert(notes).values({
  title: "My Note",
  content: "Note content"
}).returning();

// Insert multiple records
const newNotes = await db.insert(notes).values([
  { title: "Note 1", content: "Content 1" },
  { title: "Note 2", content: "Content 2" }
]).returning();
```

### Update Operations

```javascript
import { eq } from "drizzle-orm";

// Update single record
const updatedNote = await db.update(notes)
  .set({
    title: "Updated Title",
    updatedAt: new Date()
  })
  .where(eq(notes.id, 1))
  .returning();
```

### Delete Operations

```javascript
import { eq } from "drizzle-orm";

// Delete single record
const deletedNote = await db.delete(notes)
  .where(eq(notes.id, 1))
  .returning();

// Delete with conditions
await db.delete(notes)
  .where(lt(notes.createdAt, new Date('2024-01-01')));
```

## 🛠️ Troubleshooting

### Common Issues

1. **Migration not found error**
   - Ensure `migrations_dir` in wrangler.jsonc points to the correct directory
   - Run `npm run db:generate` to create migration files

2. **Database binding not found**
   - Check that the database binding name in wrangler.jsonc matches the one used in your code
   - Ensure you're logged into Cloudflare: `wrangler login`

3. **Edge runtime errors during deployment**
   - Don't use `export const runtime = "edge"` in API routes with OpenNext.js
   - Let the runtime be determined automatically

4. **Local development database issues**
   - D1 local development uses `.wrangler/state/v3/d1` directory
   - Delete this directory to reset local database if needed

### Useful Commands

```bash
# Check D1 databases
wrangler d1 list

# Execute SQL directly (for debugging)
wrangler d1 execute my-database-name --command "SELECT * FROM notes"

# Reset local database
rm -rf .wrangler/state/v3/d1 && npm run db:migrate

# Check migration status
wrangler d1 migrations list my-database-name
```

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [OpenNext.js Cloudflare Documentation](https://opennext.js.org/cloudflare)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## 🎯 Next Steps

- Add authentication with [Clerk](https://clerk.com/) or [Auth.js](https://authjs.dev/)
- Implement caching with [Cloudflare R2](https://developers.cloudflare.com/r2/)
- Add real-time features with [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)
- Set up monitoring with [Cloudflare Analytics](https://developers.cloudflare.com/analytics/)

---

Happy coding! 🎉
