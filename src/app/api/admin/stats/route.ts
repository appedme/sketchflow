import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDb } from '@/lib/db/connection';
import { users, projects, documents, canvases, files, shares } from '@/lib/db/schema';
import { count } from 'drizzle-orm';

const ADMIN_EMAIL = "sh20raj@gmail.com";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin access
    const user = await stackServerApp.getUser();
    
    if (!user || user.primaryEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const db = getDb();

    // Get counts for all entities
    const [
      totalUsers,
      totalProjects,
      totalDocuments,
      totalCanvases,
      totalFiles,
      totalShares
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(projects),
      db.select({ count: count() }).from(documents),
      db.select({ count: count() }).from(canvases),
      db.select({ count: count() }).from(files),
      db.select({ count: count() }).from(shares)
    ]);

    // Get recent activity (simplified - you can expand this)
    const recentProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt
      })
      .from(projects)
      .orderBy(projects.updatedAt)
      .limit(5);

    const recentActivity = recentProjects.map(project => ({
      description: `Project "${project.name}" was updated`,
      timestamp: new Date(project.updatedAt || project.createdAt).toLocaleString(),
      type: 'project_update'
    }));

    const stats = {
      totalUsers: totalUsers[0]?.count || 0,
      totalProjects: totalProjects[0]?.count || 0,
      totalDocuments: totalDocuments[0]?.count || 0,
      totalCanvases: totalCanvases[0]?.count || 0,
      totalFiles: totalFiles[0]?.count || 0,
      totalShares: totalShares[0]?.count || 0,
      recentActivity
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}