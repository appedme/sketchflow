import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db/connection';
import { teams, teamMembers, organizationMembers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface Params {
  params: {
    id: string;
  };
}

// GET /api/organizations/:id/teams - Get organization teams
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

    // Get all teams
    const orgTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, id));

    // Get team members count for each team
    const teamsWithMembers = await Promise.all(
      orgTeams.map(async (team) => {
        const members = await db
          .select()
          .from(teamMembers)
          .where(eq(teamMembers.teamId, team.id));

        return {
          ...team,
          memberCount: members.length,
        };
      })
    );

    return NextResponse.json({ teams: teamsWithMembers });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/:id/teams - Create team
export async function POST(request: NextRequest, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, isDefault = false } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Only admins can create teams' }, { status: 403 });
    }

    const teamId = nanoid();

    await db.insert(teams).values({
      id: teamId,
      organizationId: id,
      name,
      description,
      isDefault,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const newTeam = await db
      .select()
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    return NextResponse.json({ team: newTeam[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}
