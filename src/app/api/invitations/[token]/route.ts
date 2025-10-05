import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { organizationInvitations, organizations, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Params {
  params: {
    token: string;
  };
}

// GET /api/invitations/:token - Get invitation details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { token } = params;
    const db = getDb();

    const invitation = await db
      .select({
        invitation: organizationInvitations,
        organization: organizations,
      })
      .from(organizationInvitations)
      .leftJoin(organizations, eq(organizationInvitations.organizationId, organizations.id))
      .where(eq(organizationInvitations.token, token))
      .limit(1);

    if (!invitation.length) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const inv = invitation[0];

    // Check if already accepted
    if (inv.invitation.acceptedAt) {
      return NextResponse.json({ error: 'Invitation already accepted' }, { status: 400 });
    }

    // Check if expired
    if (new Date(inv.invitation.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation expired' }, { status: 400 });
    }

    // Get inviter details
    const inviter = await db
      .select()
      .from(users)
      .where(eq(users.id, inv.invitation.invitedBy))
      .limit(1);

    return NextResponse.json({
      invitation: {
        organization: inv.organization,
        role: inv.invitation.role,
        invitedBy: inviter[0] || { name: 'Unknown', email: '' },
        expiresAt: inv.invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}
