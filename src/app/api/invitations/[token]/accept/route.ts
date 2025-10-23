import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { organizationInvitations, organizationMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface Params {
  params: {
    token: string;
  };
}

// POST /api/invitations/:token/accept - Accept invitation
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = params;
    const db = getDb();

    const invitation = await db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.token, token))
      .limit(1);

    if (!invitation.length) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }

    const inv = invitation[0];

    if (inv.acceptedAt) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    if (new Date(inv.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Add user to organization
    await db.insert(organizationMembers).values({
      id: nanoid(),
      organizationId: inv.organizationId,
      userId,
      role: inv.role,
      invitedBy: inv.invitedBy,
      invitedAt: inv.createdAt,
      joinedAt: new Date().toISOString(),
    });

    // Mark invitation as accepted
    await db
      .update(organizationInvitations)
      .set({ acceptedAt: new Date().toISOString() })
      .where(eq(organizationInvitations.id, inv.id));

    return NextResponse.json({ 
      success: true, 
      organizationId: inv.organizationId 
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}
