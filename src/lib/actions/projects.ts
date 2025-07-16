"use server";

import { getCurrentUserId } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/connection';
import { projects, templates, projectCollaborators, type NewProject } from '@/lib/db/schema';
import { eq, and, desc, count, gte, sql } from 'drizzle-orm';

export async function createProject(formData: FormData) {
  const userId = await getCurrentUserId();

  if (!userId) {
    redirect('/sign-in');
  }

  try {
    const db = getDb();

    // Ensure user exists in database first
    const { createOrUpdateUser } = await import('./auth');
    await createOrUpdateUser();

    // Extract form data
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const visibility = formData.get('visibility') as string;
    const templateId = formData.get('template') as string;

    // Validate required fields
    if (!name || !category || !visibility) {
      throw new Error('Missing required fields');
    }

    const projectId = nanoid();

    const newProject: NewProject = {
      id: projectId,
      name,
      description: description || null,
      category,
      visibility,
      templateId: templateId !== 'blank' ? templateId : null,
      ownerId: userId,
      viewCount: 0,
      isFavorite: false,
      tags: [],
      status: 'active',
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert project
    await db.insert(projects).values(newProject);

    // Add owner as collaborator
    await db.insert(projectCollaborators).values({
      id: nanoid(),
      projectId,
      userId,
      role: 'owner',
      invitedBy: userId,
      invitedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    });

    // Redirect to the new project
    redirect(`/project/${projectId}`);
  } catch (error) {
    console.error('Error creating project:', error);
    // Don't throw error if it's a redirect
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      throw error; // Re-throw redirect errors
    }
    throw new Error('Failed to create project');
  }
}

export async function getProjects(userId: string) {
  try {
    // Ensure user exists in database first
    const { createOrUpdateUser } = await import('./auth');
    await createOrUpdateUser();

    const db = getDb();

    // Get projects where user is owner or collaborator
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        category: projects.category,
        visibility: projects.visibility,
        ownerId: projects.ownerId,
        viewCount: projects.viewCount,
        isFavorite: projects.isFavorite,
        tags: projects.tags,
        status: projects.status,
        lastActivityAt: projects.lastActivityAt,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .leftJoin(projectCollaborators, eq(projects.id, projectCollaborators.projectId))
      .where(
        and(
          eq(projectCollaborators.userId, userId),
          eq(projectCollaborators.acceptedAt, projectCollaborators.acceptedAt) // Only accepted collaborations
        )
      )
      .orderBy(desc(projects.updatedAt));

    return userProjects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export async function getProject(projectId: string, userId: string) {
  try {
    const db = getDb();

    // Get project with user's collaboration status
    const project = await db
      .select({
        project: projects,
        userRole: projectCollaborators.role,
      })
      .from(projects)
      .leftJoin(projectCollaborators,
        and(
          eq(projects.id, projectCollaborators.projectId),
          eq(projectCollaborators.userId, userId)
        )
      )
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      return null;
    }

    // Check if user has access (owner, collaborator, or public project)
    const userRole = project[0].userRole;
    const projectData = project[0].project;

    if (!userRole && projectData.visibility !== 'public') {
      return null; // No access
    }

    return {
      ...projectData,
      userRole: userRole || 'viewer',
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

export async function getProjectStats(userId: string) {
  try {
    // Ensure user exists in database first
    const { createOrUpdateUser } = await import('./auth');
    await createOrUpdateUser();

    const db = getDb();

    // Get total projects count
    const totalProjectsResult = await db
      .select({ count: count() })
      .from(projects)
      .leftJoin(projectCollaborators, eq(projects.id, projectCollaborators.projectId))
      .where(eq(projectCollaborators.userId, userId));

    // Get projects created this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekProjectsResult = await db
      .select({ count: count() })
      .from(projects)
      .leftJoin(projectCollaborators, eq(projects.id, projectCollaborators.projectId))
      .where(
        and(
          eq(projectCollaborators.userId, userId),
          gte(projects.createdAt, oneWeekAgo.toISOString())
        )
      );

    // Get total collaborators count (unique users across all projects)
    const collaboratorsResult = await db
      .select({ count: count() })
      .from(projectCollaborators)
      .leftJoin(projects, eq(projectCollaborators.projectId, projects.id))
      .where(eq(projects.ownerId, userId));

    // Get total views across all projects
    const viewsResult = await db
      .select({ totalViews: projects.viewCount })
      .from(projects)
      .leftJoin(projectCollaborators, eq(projects.id, projectCollaborators.projectId))
      .where(eq(projectCollaborators.userId, userId));

    const totalViews = viewsResult.reduce((sum, project) => sum + (project.totalViews || 0), 0);

    return {
      totalProjects: totalProjectsResult[0]?.count || 0,
      thisWeek: thisWeekProjectsResult[0]?.count || 0,
      collaborators: collaboratorsResult[0]?.count || 0,
      totalViews,
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return {
      totalProjects: 0,
      thisWeek: 0,
      collaborators: 0,
      totalViews: 0,
    };
  }
}

export async function updateProject(projectId: string, updates: Partial<NewProject>, userId: string) {
  try {
    const db = getDb();

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, userId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    await db
      .update(projects)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId));

    return { success: true };
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
}

export async function deleteProject(projectId: string, userId: string) {
  try {
    const db = getDb();

    // Check if user is owner
    const project = await db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.id, projectId),
          eq(projects.ownerId, userId)
        )
      )
      .limit(1);

    if (project.length === 0) {
      throw new Error('Project not found or insufficient permissions');
    }

    // Delete project (cascading deletes will handle related records)
    await db.delete(projects).where(eq(projects.id, projectId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
}

export async function incrementProjectViews(projectId: string) {
  try {
    const db = getDb();

    // Increment view count
    await db
      .update(projects)
      .set({
        viewCount: sql`${projects.viewCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId));

    return { success: true };
  } catch (error) {
    console.error('Error incrementing project views:', error);
    return { success: false };
  }
}

export async function toggleProjectFavorite(projectId: string, userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Get project and check permissions
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (project.length === 0) {
      throw new Error('Project not found');
    }

    const projectData = project[0];

    // Check if user has access to the project
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0) {
      throw new Error('Insufficient permissions');
    }

    const [updatedProject] = await db
      .update(projects)
      .set({
        isFavorite: !projectData.isFavorite,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return updatedProject;
  } catch (error) {
    console.error('Error toggling project favorite:', error);
    throw new Error('Failed to update project favorite');
  }
}

export async function updateProjectTags(projectId: string, tags: string[], userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    const [updatedProject] = await db
      .update(projects)
      .set({
        tags,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projects.id, projectId))
      .returning();

    return updatedProject;
  } catch (error) {
    console.error('Error updating project tags:', error);
    throw new Error('Failed to update project tags');
  }
}