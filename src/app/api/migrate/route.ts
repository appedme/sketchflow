import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { sql } from 'drizzle-orm';

/**
 * TEMPORARY MIGRATION ENDPOINT
 * This endpoint safely adds organization and team tables to the database
 * WITHOUT deleting any existing data.
 * 
 * Safety features:
 * - Uses CREATE TABLE IF NOT EXISTS (won't fail if tables exist)
 * - Uses ADD COLUMN IF NOT EXISTS where supported
 * - Only adds new structures, never removes
 * - All operations are wrapped in try-catch
 * - Returns detailed status of each operation
 * 
 * DELETE THIS FILE AFTER MIGRATION IS COMPLETE
 */

export async function POST(request: NextRequest) {
  // Security check - only allow in development or with secret key
  const authHeader = request.headers.get('x-migration-secret');
  const expectedSecret = process.env.MIGRATION_SECRET || 'dev-only-secret';
  
  if (process.env.NODE_ENV === 'production' && authHeader !== expectedSecret) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const results: { step: string; status: 'success' | 'error' | 'skipped'; message: string }[] = [];

  // Initialize database connection
  let db;
  try {
    db = getDb();
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Database connection failed',
        message: error.message,
        hint: 'Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env.local',
      },
      { status: 500 }
    );
  }

  try {
    // Step 1: Create Organizations table
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS "organizations" (
          "id" text PRIMARY KEY NOT NULL,
          "name" text NOT NULL,
          "slug" text NOT NULL UNIQUE,
          "description" text,
          "avatar_url" text,
          "plan" text DEFAULT 'free' NOT NULL,
          "max_members" integer DEFAULT 5,
          "max_projects" integer DEFAULT 10,
          "settings" text,
          "created_by" text NOT NULL,
          "created_at" text DEFAULT CURRENT_TIMESTAMP,
          "updated_at" text DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
      `);
      results.push({ step: 'organizations_table', status: 'success', message: 'Organizations table created or already exists' });
    } catch (error: any) {
      results.push({ step: 'organizations_table', status: 'error', message: error.message });
    }

    // Step 2: Create Organization Members table
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS "organization_members" (
          "id" text PRIMARY KEY NOT NULL,
          "organization_id" text NOT NULL,
          "user_id" text NOT NULL,
          "role" text DEFAULT 'member' NOT NULL,
          "title" text,
          "invited_by" text,
          "invited_at" text DEFAULT CURRENT_TIMESTAMP,
          "joined_at" text,
          "last_active_at" text,
          FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
      `);
      results.push({ step: 'organization_members_table', status: 'success', message: 'Organization members table created or already exists' });
    } catch (error: any) {
      results.push({ step: 'organization_members_table', status: 'error', message: error.message });
    }

    // Step 3: Create Teams table
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS "teams" (
          "id" text PRIMARY KEY NOT NULL,
          "organization_id" text NOT NULL,
          "name" text NOT NULL,
          "description" text,
          "avatar_url" text,
          "is_default" integer DEFAULT 0,
          "settings" text,
          "created_by" text NOT NULL,
          "created_at" text DEFAULT CURRENT_TIMESTAMP,
          "updated_at" text DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("created_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
      `);
      results.push({ step: 'teams_table', status: 'success', message: 'Teams table created or already exists' });
    } catch (error: any) {
      results.push({ step: 'teams_table', status: 'error', message: error.message });
    }

    // Step 4: Create Team Members table
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS "team_members" (
          "id" text PRIMARY KEY NOT NULL,
          "team_id" text NOT NULL,
          "user_id" text NOT NULL,
          "role" text DEFAULT 'member' NOT NULL,
          "added_by" text NOT NULL,
          "added_at" text DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("team_id") REFERENCES "teams"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("added_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
      `);
      results.push({ step: 'team_members_table', status: 'success', message: 'Team members table created or already exists' });
    } catch (error: any) {
      results.push({ step: 'team_members_table', status: 'error', message: error.message });
    }

    // Step 5: Create Organization Invitations table
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS "organization_invitations" (
          "id" text PRIMARY KEY NOT NULL,
          "organization_id" text NOT NULL,
          "email" text NOT NULL,
          "role" text DEFAULT 'member' NOT NULL,
          "token" text NOT NULL UNIQUE,
          "invited_by" text NOT NULL,
          "expires_at" text NOT NULL,
          "accepted_at" text,
          "created_at" text DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON UPDATE no action ON DELETE cascade,
          FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON UPDATE no action ON DELETE no action
        )
      `);
      results.push({ step: 'organization_invitations_table', status: 'success', message: 'Organization invitations table created or already exists' });
    } catch (error: any) {
      results.push({ step: 'organization_invitations_table', status: 'error', message: error.message });
    }

    // Step 6: Add organization_id column to projects table (SQLite doesn't support IF NOT EXISTS for ALTER TABLE)
    try {
      // Check if column already exists
      const tableInfo = await db.all(sql`PRAGMA table_info(projects)`);
      const hasOrgIdColumn = tableInfo.some((col: any) => col.name === 'organization_id');
      
      if (!hasOrgIdColumn) {
        await db.run(sql`ALTER TABLE "projects" ADD COLUMN "organization_id" text REFERENCES "organizations"("id") ON DELETE cascade`);
        results.push({ step: 'projects_organization_id_column', status: 'success', message: 'Added organization_id column to projects table' });
      } else {
        results.push({ step: 'projects_organization_id_column', status: 'skipped', message: 'Column organization_id already exists in projects table' });
      }
    } catch (error: any) {
      results.push({ step: 'projects_organization_id_column', status: 'error', message: error.message });
    }

    // Step 7: Add team_id column to projects table
    try {
      const tableInfo = await db.all(sql`PRAGMA table_info(projects)`);
      const hasTeamIdColumn = tableInfo.some((col: any) => col.name === 'team_id');
      
      if (!hasTeamIdColumn) {
        await db.run(sql`ALTER TABLE "projects" ADD COLUMN "team_id" text REFERENCES "teams"("id")`);
        results.push({ step: 'projects_team_id_column', status: 'success', message: 'Added team_id column to projects table' });
      } else {
        results.push({ step: 'projects_team_id_column', status: 'skipped', message: 'Column team_id already exists in projects table' });
      }
    } catch (error: any) {
      results.push({ step: 'projects_team_id_column', status: 'error', message: error.message });
    }

    // Step 8: Create indexes
    const indexes = [
      { name: 'idx_org_members_org_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_org_members_org_id" ON "organization_members"("organization_id")' },
      { name: 'idx_org_members_user_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_org_members_user_id" ON "organization_members"("user_id")' },
      { name: 'idx_teams_org_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_teams_org_id" ON "teams"("organization_id")' },
      { name: 'idx_team_members_team_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_team_members_team_id" ON "team_members"("team_id")' },
      { name: 'idx_team_members_user_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_team_members_user_id" ON "team_members"("user_id")' },
      { name: 'idx_projects_org_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_projects_org_id" ON "projects"("organization_id")' },
      { name: 'idx_projects_team_id', sql: 'CREATE INDEX IF NOT EXISTS "idx_projects_team_id" ON "projects"("team_id")' },
      { name: 'idx_org_invitations_token', sql: 'CREATE INDEX IF NOT EXISTS "idx_org_invitations_token" ON "organization_invitations"("token")' },
      { name: 'idx_org_invitations_email', sql: 'CREATE INDEX IF NOT EXISTS "idx_org_invitations_email" ON "organization_invitations"("email")' },
    ];

    for (const index of indexes) {
      try {
        await db.run(sql.raw(index.sql));
        results.push({ step: `index_${index.name}`, status: 'success', message: `Created index ${index.name}` });
      } catch (error: any) {
        results.push({ step: `index_${index.name}`, status: 'error', message: error.message });
      }
    }

    // Summary
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return NextResponse.json({
      success: errorCount === 0,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        skipped: skippedCount,
      },
      results,
      message: errorCount === 0 
        ? '✅ Migration completed successfully! All tables and columns added safely.' 
        : '⚠️ Migration completed with some errors. Check results for details.',
      warning: '🗑️ REMEMBER TO DELETE /src/app/api/migrate/route.ts AFTER MIGRATION!',
    });

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        message: error.message,
        results,
      },
      { status: 500 }
    );
  }
}

// GET method to check migration status
export async function GET() {
  try {
    // Initialize database connection
    let db;
    try {
      db = getDb();
    } catch (error: any) {
      return NextResponse.json(
        {
          error: 'Database connection failed',
          message: error.message,
          hint: 'Make sure TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are set in .env.local',
        },
        { status: 500 }
      );
    }
    
    const checks = [];

    // Check if tables exist
    const tables = ['organizations', 'organization_members', 'teams', 'team_members', 'organization_invitations'];
    
    for (const table of tables) {
      try {
        const result = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' AND name=${table}`);
        checks.push({
          table,
          exists: result.length > 0,
        });
      } catch (error: any) {
        checks.push({
          table,
          exists: false,
          error: error.message,
        });
      }
    }

    // Check if columns exist in projects table
    try {
      const tableInfo = await db.all(sql`PRAGMA table_info(projects)`);
      const columns = tableInfo.map((col: any) => col.name);
      checks.push({
        table: 'projects',
        hasOrgColumn: columns.includes('organization_id'),
        hasTeamColumn: columns.includes('team_id'),
      });
    } catch (error: any) {
      checks.push({
        table: 'projects',
        error: error.message,
      });
    }

    return NextResponse.json({
      checks,
      allTablesExist: checks.filter(c => c.exists === true).length === tables.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check migration status', message: error.message },
      { status: 500 }
    );
  }
}
