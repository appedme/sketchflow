import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { organizations, organizationMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { stackServerApp } from '@/lib/stack';

// GET /api/organizations - Get all organizations for current user
export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    const db = getDb();

    // Get organizations where user is a member
    const userOrgs = await db
      .select({
        organization: organizations,
        membership: organizationMembers,
      })
      .from(organizationMembers)
      .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));

    return NextResponse.json({ organizations: userOrgs });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create a new organization
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = user.id;

    const body = await request.json();
    const { name, description, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const db = getDb();
    const orgId = nanoid();
    const memberId = nanoid();

    // Create organization
    await db.insert(organizations).values({
      id: orgId,
      name,
      slug,
      description,
      plan: 'free',
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Add creator as owner
    await db.insert(organizationMembers).values({
      id: memberId,
      organizationId: orgId,
      userId,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      invitedAt: new Date().toISOString(),
    });

    const newOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    return NextResponse.json({ organization: newOrg[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { error: 'Failed to create organization' },
      { status: 500 }
    );
  }
}
