"use server";

import { getDb } from '@/lib/db/connection';
import { 
  organizations, 
  organizationMembers, 
  teams, 
  teamMembers,
  organizationInvitations,
  users
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// Organization Operations

export async function createOrganization(
  userId: string,
  data: { name: string; slug: string; description?: string }
) {
  const db = getDb();
  const orgId = nanoid();
  const memberId = nanoid();

  try {
    // Create organization
    await db.insert(organizations).values({
      id: orgId,
      name: data.name,
      slug: data.slug,
      description: data.description,
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

    return { success: true, organizationId: orgId };
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, error: 'Failed to create organization' };
  }
}

export async function getUserOrganizations(userId: string) {
  const db = getDb();

  try {
    const userOrgs = await db
      .select({
        organization: organizations,
        membership: organizationMembers,
      })
      .from(organizationMembers)
      .leftJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));

    return { success: true, organizations: userOrgs };
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return { success: false, error: 'Failed to fetch organizations' };
  }
}

export async function getOrganization(orgId: string, userId: string) {
  const db = getDb();

  try {
    // Check membership
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!membership.length) {
      return { success: false, error: 'Access denied' };
    }

    const org = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, orgId))
      .limit(1);

    return { success: true, organization: org[0], membership: membership[0] };
  } catch (error) {
    console.error('Error fetching organization:', error);
    return { success: false, error: 'Failed to fetch organization' };
  }
}

export async function updateOrganization(
  orgId: string,
  userId: string,
  data: { name?: string; description?: string; slug?: string }
) {
  const db = getDb();

  try {
    // Check if user is admin or owner
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!membership.length || !['owner', 'admin'].includes(membership[0].role)) {
      return { success: false, error: 'Access denied' };
    }

    await db
      .update(organizations)
      .set({
        ...data,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(organizations.id, orgId));

    return { success: true };
  } catch (error) {
    console.error('Error updating organization:', error);
    return { success: false, error: 'Failed to update organization' };
  }
}

// Team Operations

export async function createTeam(
  orgId: string,
  userId: string,
  data: { name: string; description?: string; isDefault?: boolean }
) {
  const db = getDb();

  try {
    // Check if user is admin or owner
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!membership.length || !['owner', 'admin'].includes(membership[0].role)) {
      return { success: false, error: 'Access denied' };
    }

    const teamId = nanoid();

    await db.insert(teams).values({
      id: teamId,
      organizationId: orgId,
      name: data.name,
      description: data.description,
      isDefault: data.isDefault || false,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return { success: true, teamId };
  } catch (error) {
    console.error('Error creating team:', error);
    return { success: false, error: 'Failed to create team' };
  }
}

export async function getOrganizationTeams(orgId: string, userId: string) {
  const db = getDb();

  try {
    // Check membership
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!membership.length) {
      return { success: false, error: 'Access denied' };
    }

    const orgTeams = await db
      .select()
      .from(teams)
      .where(eq(teams.organizationId, orgId));

    return { success: true, teams: orgTeams };
  } catch (error) {
    console.error('Error fetching teams:', error);
    return { success: false, error: 'Failed to fetch teams' };
  }
}

export async function addTeamMember(
  teamId: string,
  userId: string,
  targetUserId: string,
  role: string = 'member'
) {
  const db = getDb();

  try {
    const memberId = nanoid();

    await db.insert(teamMembers).values({
      id: memberId,
      teamId,
      userId: targetUserId,
      role,
      addedBy: userId,
      addedAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error adding team member:', error);
    return { success: false, error: 'Failed to add team member' };
  }
}

// Member Operations

export async function getOrganizationMembers(orgId: string, userId: string) {
  const db = getDb();

  try {
    // Check membership
    const userMembership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!userMembership.length) {
      return { success: false, error: 'Access denied' };
    }

    const members = await db
      .select({
        membership: organizationMembers,
        user: users,
      })
      .from(organizationMembers)
      .leftJoin(users, eq(organizationMembers.userId, users.id))
      .where(eq(organizationMembers.organizationId, orgId));

    return { success: true, members };
  } catch (error) {
    console.error('Error fetching members:', error);
    return { success: false, error: 'Failed to fetch members' };
  }
}

export async function inviteMember(
  orgId: string,
  userId: string,
  email: string,
  role: string = 'member'
) {
  const db = getDb();

  try {
    // Check if user is admin or owner
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!membership.length || !['owner', 'admin'].includes(membership[0].role)) {
      return { success: false, error: 'Only admins can invite members' };
    }

    const token = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await db.insert(organizationInvitations).values({
      id: nanoid(),
      organizationId: orgId,
      email,
      role,
      token,
      invitedBy: userId,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
    });

    return { success: true, token, inviteLink: `/invite/${token}` };
  } catch (error) {
    console.error('Error inviting member:', error);
    return { success: false, error: 'Failed to invite member' };
  }
}

export async function acceptInvitation(token: string, userId: string) {
  const db = getDb();

  try {
    const invitation = await db
      .select()
      .from(organizationInvitations)
      .where(eq(organizationInvitations.token, token))
      .limit(1);

    if (!invitation.length) {
      return { success: false, error: 'Invalid invitation' };
    }

    const inv = invitation[0];

    if (inv.acceptedAt) {
      return { success: false, error: 'Invitation already accepted' };
    }

    if (new Date(inv.expiresAt) < new Date()) {
      return { success: false, error: 'Invitation expired' };
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

    return { success: true, organizationId: inv.organizationId };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return { success: false, error: 'Failed to accept invitation' };
  }
}

export async function removeMember(
  orgId: string,
  userId: string,
  targetUserId: string
) {
  const db = getDb();

  try {
    // Check if user is admin or owner
    const membership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, userId)
      ))
      .limit(1);

    if (!membership.length || !['owner', 'admin'].includes(membership[0].role)) {
      return { success: false, error: 'Access denied' };
    }

    // Don't allow removing the owner
    const targetMembership = await db
      .select()
      .from(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, targetUserId)
      ))
      .limit(1);

    if (targetMembership.length && targetMembership[0].role === 'owner') {
      return { success: false, error: 'Cannot remove the organization owner' };
    }

    await db
      .delete(organizationMembers)
      .where(and(
        eq(organizationMembers.organizationId, orgId),
        eq(organizationMembers.userId, targetUserId)
      ));

    return { success: true };
  } catch (error) {
    console.error('Error removing member:', error);
    return { success: false, error: 'Failed to remove member' };
  }
}
