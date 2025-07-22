import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDb } from '@/lib/db/connection';
import { projects, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    
    // Get all projects with owner information
    const allProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        category: projects.category,
        visibility: projects.visibility,
        ownerId: projects.ownerId,
        viewCount: projects.viewCount,
        status: projects.status,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        ownerEmail: users.email,
        ownerFirstName: users.firstName,
        ownerLastName: users.lastName
      })
      .from(projects)
      .leftJoin(users, eq(projects.ownerId, users.id))
      .orderBy(projects.updatedAt);

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}