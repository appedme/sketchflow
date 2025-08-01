"use server";

import { getCurrentUserId } from '@/lib/actions/auth';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/connection';
import { canvases, projects, projectCollaborators, type NewCanvas } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { generateUniqueCanvasId } from '@/lib/utils/id-generator';

export async function createCanvas(projectId: string, title: string, elements?: any, appState?: any, files?: any, userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Check if user has edit permissions on the project
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

    const canvasId = await generateUniqueCanvasId();
    const defaultElements = elements || [];
    const defaultAppState = appState || {
      viewBackgroundColor: '#ffffff',
      currentItemStrokeColor: '#000000',
      currentItemBackgroundColor: 'transparent',
      currentItemFillStyle: 'hachure',
      currentItemStrokeWidth: 1,
      currentItemStrokeStyle: 'solid',
      currentItemRoughness: 1,
      currentItemOpacity: 100,
      currentItemFontFamily: 1,
      currentItemFontSize: 20,
      currentItemTextAlign: 'left',
      currentItemStartArrowhead: null,
      currentItemEndArrowhead: 'arrow',
      scrollX: 0,
      scrollY: 0,
      zoom: { value: 1 },
      currentItemRoundness: 'round',
      gridSize: null,
      colorPalette: {},
    };

    const newCanvas: NewCanvas = {
      id: canvasId,
      projectId,
      title,
      elements: defaultElements,
      appState: defaultAppState,
      files: files || {},
      elementCount: Array.isArray(defaultElements) ? defaultElements.length : 0,
      version: 1,
      isFavorite: false,
      tags: [],
      status: 'draft',
      lastEditedBy: currentUserId,
      createdBy: currentUserId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [createdCanvas] = await db.insert(canvases).values(newCanvas).returning();

    return createdCanvas;
  } catch (error) {
    console.error('Error creating canvas:', error);
    throw new Error('Failed to create canvas');
  }
}

export async function getCanvases(projectId: string, userId?: string) {
  try {
    const db = getDb();

    // If user is provided, check collaboration access
    if (userId) {
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

      if (collaboration.length === 0) {
        // Check if project is public
        const project = await db
          .select()
          .from(projects)
          .where(
            and(
              eq(projects.id, projectId),
              eq(projects.visibility, 'public')
            )
          )
          .limit(1);

        if (project.length === 0) {
          throw new Error('Access denied');
        }
      }
    } else {
      // For unauthenticated users, only allow access to public projects
      const project = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.id, projectId),
            eq(projects.visibility, 'public')
          )
        )
        .limit(1);

      if (project.length === 0) {
        throw new Error('Access denied - project not public');
      }
    }

    const projectCanvases = await db
      .select({
        id: canvases.id,
        title: canvases.title,
        elements: canvases.elements,
        appState: canvases.appState,
        files: canvases.files,
        elementCount: canvases.elementCount,
        version: canvases.version,
        isFavorite: canvases.isFavorite,
        tags: canvases.tags,
        status: canvases.status,
        lastEditedBy: canvases.lastEditedBy,
        createdBy: canvases.createdBy,
        createdAt: canvases.createdAt,
        updatedAt: canvases.updatedAt,
      })
      .from(canvases)
      .where(eq(canvases.projectId, projectId))
      .orderBy(desc(canvases.updatedAt));

    return projectCanvases;
  } catch (error) {
    console.error('Error fetching canvases:', error);
    throw error; // Re-throw the error instead of returning empty array
  }
}

export async function getCanvas(canvasId: string, userId?: string) {
  try {
    const db = getDb();

    // Get canvas with project info
    const canvas = await db
      .select({
        canvas: canvases,
        project: projects,
      })
      .from(canvases)
      .leftJoin(projects, eq(canvases.projectId, projects.id))
      .where(eq(canvases.id, canvasId))
      .limit(1);

    if (canvas.length === 0) {
      return null;
    }

    const canvasData = canvas[0].canvas;
    const projectData = canvas[0].project;

    // Check access permissions
    if (projectData?.visibility !== 'public') {
      // Private project - require authentication and collaboration
      if (!userId) {
        return null; // No access for unauthenticated users
      }

      const collaboration = await db
        .select()
        .from(projectCollaborators)
        .where(
          and(
            eq(projectCollaborators.projectId, canvasData.projectId),
            eq(projectCollaborators.userId, userId)
          )
        )
        .limit(1);

      if (collaboration.length === 0) {
        return null; // No access
      }
    }
    // Public project - allow access regardless of authentication

    return canvasData;
  } catch (error) {
    console.error('Error fetching canvas:', error);
    return null;
  }
}

export async function updateCanvas(canvasId: string, elements: any, appState: any, files?: any, userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Get canvas and check permissions
    const canvas = await db
      .select()
      .from(canvases)
      .where(eq(canvases.id, canvasId))
      .limit(1);

    if (canvas.length === 0) {
      throw new Error('Canvas not found');
    }

    const canvasData = canvas[0];

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, canvasData.projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    const updates: any = {
      elements,
      appState,
      elementCount: Array.isArray(elements) ? elements.length : 0,
      version: canvasData.version + 1,
      lastEditedBy: currentUserId,
      updatedAt: new Date().toISOString(),
    };

    if (files !== undefined) {
      updates.files = files;
    }

    await db
      .update(canvases)
      .set(updates)
      .where(eq(canvases.id, canvasId));

    return { success: true };
  } catch (error) {
    console.error('Error updating canvas:', error);
    throw new Error('Failed to update canvas');
  }
}

export async function updateCanvasMetadata(canvasId: string, updates: { title?: string; elements?: any; appState?: any; files?: any }, userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Get canvas and check permissions
    const canvas = await db
      .select()
      .from(canvases)
      .where(eq(canvases.id, canvasId))
      .limit(1);

    if (canvas.length === 0) {
      throw new Error('Canvas not found');
    }

    const canvasData = canvas[0];

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, canvasData.projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    const updateData: any = {
      version: canvasData.version + 1,
      updatedAt: new Date().toISOString(),
    };

    if (updates.title !== undefined) {
      updateData.title = updates.title;
    }
    if (updates.elements !== undefined) {
      updateData.elements = updates.elements;
    }
    if (updates.appState !== undefined) {
      updateData.appState = updates.appState;
    }
    if (updates.files !== undefined) {
      updateData.files = updates.files;
    }

    const [updatedCanvas] = await db
      .update(canvases)
      .set(updateData)
      .where(eq(canvases.id, canvasId))
      .returning();

    return updatedCanvas;
  } catch (error) {
    console.error('Error updating canvas metadata:', error);
    throw new Error('Failed to update canvas');
  }
}

export async function deleteCanvas(canvasId: string, userId: string) {
  try {
    const db = getDb();

    // Get canvas and check permissions
    const canvas = await db
      .select()
      .from(canvases)
      .where(eq(canvases.id, canvasId))
      .limit(1);

    if (canvas.length === 0) {
      throw new Error('Canvas not found');
    }

    const canvasData = canvas[0];

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, canvasData.projectId),
          eq(projectCollaborators.userId, userId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    await db.delete(canvases).where(eq(canvases.id, canvasId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting canvas:', error);
    throw new Error('Failed to delete canvas');
  }
} export async function toggleCanvasFavorite(canvasId: string, userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Get canvas and check permissions
    const canvas = await db
      .select()
      .from(canvases)
      .where(eq(canvases.id, canvasId))
      .limit(1);

    if (canvas.length === 0) {
      throw new Error('Canvas not found');
    }

    const canvasData = canvas[0];

    // Check if user has access to the project
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, canvasData.projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0) {
      throw new Error('Insufficient permissions');
    }

    const [updatedCanvas] = await db
      .update(canvases)
      .set({
        isFavorite: !canvasData.isFavorite,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(canvases.id, canvasId))
      .returning();

    return updatedCanvas;
  } catch (error) {
    console.error('Error toggling canvas favorite:', error);
    throw new Error('Failed to update canvas favorite');
  }
}