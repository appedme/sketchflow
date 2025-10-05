import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { organizationMembers, users, organizationInvitations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/organizations/:id/members - Get organization members
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = getDb();

    // Check if user is a member
    const userMembership = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, id))
      .where(eq(organizationMembers.userId, userId))
      .limit(1);

    if (!userMembership.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get all members with user details
    const members = await db
      .select({
        membership: organizationMembers,
        user: users,
      })
      .from(organizationMembers)
      .leftJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, id));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/:id/members - Invite member
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const db = getDb();

    // Check if user is admin or owner
    const userMembership = await db
      .select()
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, id))
      .where(eq(organizationMembers.userId, userId))
      .limit(1);

    if (!userMembership.length || !['owner', 'admin'].includes(userMembership[0].role)) {
      return NextResponse.json({ error: 'Only admins can invite members' }, { status: 403 });
    }

    // Create invitation
    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await db.insert(organizationInvitations).values({
      id: nanoid(),
      organizationId: id,
      email,
      role,
      token,
      invitedBy: userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    // TODO: Send email invitation

    return NextResponse.json({ 
      success: true, 
      message: 'Invitation sent',
      inviteLink: `/invite/${token}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error inviting member:', error);
    return NextResponse.json(
      { error: 'Failed to invite member' },
      { status: 500 }
    );
  }
}
