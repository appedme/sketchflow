import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { organizations, organizationMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/organizations/:id - Get organization details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = getDb();

    // Check if user is a member
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        eq(organizationMembers.organizationId, id) &&
        eq(organizationMembers.userId, userId)
      )
      .limit(1);

    if (!membership.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    if (!org.length) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json({ organization: org[0], membership: membership[0] });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/:id - Update organization
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const db = getDb();

    // Check if user is admin or owner
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        eq(organizationMembers.organizationId, id) &&
        eq(organizationMembers.userId, userId)
      )
      .limit(1);

    if (!membership.length || !['owner', 'admin'].includes(membership[0].role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await db
      .update(organizations)
      .set({
        ...body,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(organizations.id, id));

    const updated = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, id))
      .limit(1);

    return NextResponse.json({ organization: updated[0] });
  } catch (error) {
    console.error('Error updating organization:', error);
    return NextResponse.json(
      { error: 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/:id - Delete organization
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = getDb();

    // Check if user is owner
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(
        eq(organizationMembers.organizationId, id) &&
        eq(organizationMembers.userId, userId)
      )
      .limit(1);

    if (!membership.length || membership[0].role !== 'owner') {
      return NextResponse.json({ error: 'Only owners can delete organizations' }, { status: 403 });
    }

    await db.delete(organizations).where(eq(organizations.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting organization:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
