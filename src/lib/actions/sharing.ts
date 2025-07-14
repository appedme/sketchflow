"use server";

import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/connection';
import { shares, projects, documents, canvases, projectCollaborators, type NewShare } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function createShare(
  itemId: string,
  itemType: 'project' | 'document' | 'canvas',
  settings: {
    shareType: 'public' | 'private' | 'embed';
    embedSettings?: {
      toolbar: boolean;
      edit: boolean;
      size: string;
    };
    expiresAt?: string;
  }
) {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();
    
    // Check permissions based on item type
    let projectId: string | null = null;
    
    if (itemType === 'project') {
      projectId = itemId;
    } else if (itemType === 'document') {
      const document = await db
        .select({ projectId: documents.projectId })
        .from(documents)
        .where(eq(documents.id, itemId))
        .limit(1);
      
      if (document.length === 0) {
        throw new Error('Document not found');
      }
      projectId = document[0].projectId;
    } else if (itemType === 'canvas') {
      const canvas = await db
        .select({ projectId: canvases.projectId })
        .from(canvases)
        .where(eq(canvases.id, itemId))
        .limit(1);
      
      if (canvas.length === 0) {
        throw new Error('Canvas not found');
      }
      projectId = canvas[0].projectId;
    }

    if (!projectId) {
      throw new Error('Invalid item');
    }

    // Check if user has permissions to share
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

    const shareId = nanoid();
    const shareToken = nanoid(32); // Longer token for security

    const newShare: NewShare = {
      id: shareId,
      projectId: itemType === 'project' ? itemId : null,
      documentId: itemType === 'document' ? itemId : null,
      canvasId: itemType === 'canvas' ? itemId : null,
      shareToken,
      shareType: settings.shareType,
      embedSettings: settings.embedSettings || null,
      expiresAt: settings.expiresAt || null,
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };

    await db.insert(shares).values(newShare);

    return {
      success: true,
      shareId,
      shareToken,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${shareToken}`,
      embedUrl: settings.shareType === 'embed' 
        ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/embed/${itemType}/${itemId}?token=${shareToken}`
        : null,
    };
  } catch (error) {
    console.error('Error creating share:', error);
    throw new Error('Failed to create share');
  }
}

export async function getShare(shareToken: string) {
  try {
    const db = getDb();
    
    const share = await db
      .select()
      .from(shares)
      .where(eq(shares.shareToken, shareToken))
      .limit(1);

    if (share.length === 0) {
      return null;
    }

    const shareData = share[0];

    // Check if share has expired
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      return null;
    }

    return shareData;
  } catch (error) {
    console.error('Error fetching share:', error);
    return null;
  }
}

export async function getPublicProject(shareToken: string) {
  try {
    const db = getDb();
    
    const share = await getShare(shareToken);
    if (!share) {
      return null;
    }

    // Get the shared item based on type
    if (share.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, share.projectId))
        .limit(1);
      
      return project[0] || null;
    } else if (share.documentId) {
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, share.documentId))
        .limit(1);
      
      return document[0] || null;
    } else if (share.canvasId) {
      const canvas = await db
        .select()
        .from(canvases)
        .where(eq(canvases.id, share.canvasId))
        .limit(1);
      
      return canvas[0] || null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching public project:', error);
    return null;
  }
}

export async function updateShareSettings(
  shareId: string,
  settings: {
    shareType?: 'public' | 'private' | 'embed';
    embedSettings?: {
      toolbar: boolean;
      edit: boolean;
      size: string;
    };
    expiresAt?: string;
  },
  userId: string
) {
  try {
    const db = getDb();
    
    // Get share and check permissions
    const share = await db
      .select()
      .from(shares)
      .where(eq(shares.id, shareId))
      .limit(1);

    if (share.length === 0) {
      throw new Error('Share not found');
    }

    const shareData = share[0];

    // Check if user created the share or has project permissions
    if (shareData.createdBy !== userId) {
      // Check project permissions
      const projectId = shareData.projectId || shareData.documentId || shareData.canvasId;
      if (projectId) {
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
      } else {
        throw new Error('Insufficient permissions');
      }
    }

    const updates: any = {};
    
    if (settings.shareType) {
      updates.shareType = settings.shareType;
    }
    
    if (settings.embedSettings) {
      updates.embedSettings = settings.embedSettings;
    }
    
    if (settings.expiresAt !== undefined) {
      updates.expiresAt = settings.expiresAt;
    }

    await db
      .update(shares)
      .set(updates)
      .where(eq(shares.id, shareId));

    return { success: true };
  } catch (error) {
    console.error('Error updating share settings:', error);
    throw new Error('Failed to update share settings');
  }
}

export async function deleteShare(shareId: string, userId: string) {
  try {
    const db = getDb();
    
    // Get share and check permissions
    const share = await db
      .select()
      .from(shares)
      .where(eq(shares.id, shareId))
      .limit(1);

    if (share.length === 0) {
      throw new Error('Share not found');
    }

    const shareData = share[0];

    // Check if user created the share or has project permissions
    if (shareData.createdBy !== userId) {
      // Check project permissions
      const projectId = shareData.projectId || shareData.documentId || shareData.canvasId;
      if (projectId) {
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
      } else {
        throw new Error('Insufficient permissions');
      }
    }

    await db.delete(shares).where(eq(shares.id, shareId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting share:', error);
    throw new Error('Failed to delete share');
  }
}