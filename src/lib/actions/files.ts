"use server";

import { getCurrentUserId } from '@/lib/actions/auth';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/connection';
import { files, projectCollaborators, type NewFile } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// R2 Storage utilities
function getR2Storage() {
  // In Cloudflare Workers/Pages environment
  if (typeof globalThis !== 'undefined' && 'STORAGE' in globalThis) {
    return globalThis.STORAGE as R2Bucket;
  }

  throw new Error('R2 Storage not available. Make sure R2 binding is configured.');
}

export async function uploadFile(
  file: File,
  projectId?: string,
  documentId?: string,
  canvasId?: string
) {
  const userId = await getCurrentUserId();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();
    const storage = getR2Storage();

    // Check permissions if uploading to a project
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
    }

    const fileId = nanoid();
    const fileExtension = file.name.split('.').pop() || '';
    const fileName = `${fileId}.${fileExtension}`;
    const filePath = `uploads/${userId}/${fileName}`;

    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await storage.put(filePath, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        contentDisposition: `attachment; filename="${file.name}"`,
      },
    });

    // Save file metadata to database
    const newFile: NewFile = {
      id: fileId,
      projectId: projectId || null,
      documentId: documentId || null,
      canvasId: canvasId || null,
      filename: fileName,
      originalName: file.name,
      fileType: file.type,
      fileSize: file.size,
      storageUrl: filePath,
      uploadedBy: userId,
      createdAt: new Date().toISOString(),
    };

    await db.insert(files).values(newFile);

    return {
      success: true,
      fileId,
      fileName,
      fileUrl: `/api/files/${fileId}`, // We'll create this API route
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload file');
  }
}

export async function getFile(fileId: string, userId: string) {
  try {
    const db = getDb();

    const file = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    if (file.length === 0) {
      return null;
    }

    const fileData = file[0];

    // Check permissions
    if (fileData.projectId) {
      const collaboration = await db
        .select()
        .from(projectCollaborators)
        .where(
          and(
            eq(projectCollaborators.projectId, fileData.projectId),
            eq(projectCollaborators.userId, userId)
          )
        )
        .limit(1);

      if (collaboration.length === 0) {
        return null; // No access
      }
    } else if (fileData.uploadedBy !== userId) {
      return null; // Only uploader can access files not in projects
    }

    return fileData;
  } catch (error) {
    console.error('Error fetching file:', error);
    return null;
  }
}

export async function getFileContent(fileId: string, userId: string) {
  try {
    const db = getDb();
    const storage = getR2Storage();

    // Get file metadata and check permissions
    const fileData = await getFile(fileId, userId);
    if (!fileData) {
      throw new Error('File not found or access denied');
    }

    // Get file from R2
    const object = await storage.get(fileData.storageUrl);
    if (!object) {
      throw new Error('File not found in storage');
    }

    return {
      content: object.body,
      metadata: {
        contentType: fileData.fileType,
        fileName: fileData.originalName,
        fileSize: fileData.fileSize,
      },
    };
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw new Error('Failed to fetch file content');
  }
}

export async function deleteFile(fileId: string, userId: string) {
  try {
    const db = getDb();
    const storage = getR2Storage();

    // Get file and check permissions
    const fileData = await getFile(fileId, userId);
    if (!fileData) {
      throw new Error('File not found or access denied');
    }

    // Check if user can delete (owner or uploader)
    if (fileData.projectId) {
      const collaboration = await db
        .select()
        .from(projectCollaborators)
        .where(
          and(
            eq(projectCollaborators.projectId, fileData.projectId),
            eq(projectCollaborators.userId, userId)
          )
        )
        .limit(1);

      if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
        throw new Error('Insufficient permissions');
      }
    } else if (fileData.uploadedBy !== userId) {
      throw new Error('Only the uploader can delete this file');
    }

    // Delete from R2
    await storage.delete(fileData.storageUrl);

    // Delete from database
    await db.delete(files).where(eq(files.id, fileId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

export async function getProjectFiles(projectId: string, userId: string) {
  try {
    const db = getDb();

    // Check project access
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
      throw new Error('Access denied');
    }

    const projectFiles = await db
      .select({
        id: files.id,
        filename: files.filename,
        originalName: files.originalName,
        fileType: files.fileType,
        fileSize: files.fileSize,
        uploadedBy: files.uploadedBy,
        createdAt: files.createdAt,
      })
      .from(files)
      .where(eq(files.projectId, projectId));

    return projectFiles;
  } catch (error) {
    console.error('Error fetching project files:', error);
    return [];
  }
}