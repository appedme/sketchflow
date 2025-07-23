"use server";

import { getCurrentUserId } from '@/lib/actions/auth';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/connection';
import { documents, projects, projectCollaborators, type NewDocument } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createDocument(projectId: string, title: string, content?: any) {
  const userId = await getCurrentUserId();

  if (!userId) {
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
          eq(projectCollaborators.userId, userId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    const documentId = nanoid();
    const defaultContent = content || [
      {
        type: 'h1',
        children: [{ text: 'Welcome to your document!' }],
      },
      {
        type: 'p',
        children: [
          { text: 'Start writing your content here. You can use ' },
          { text: 'formatting', bold: true },
          { text: ', create ' },
          { text: 'lists', italic: true },
          { text: ', add links, and much more.' },
        ],
      },
      {
        type: 'p',
        children: [{ text: '' }],
      },
    ];

    // Extract text content for search and calculate metrics
    const contentText = extractTextFromContent(defaultContent);
    const wordCount = calculateWordCount(contentText);
    const readingTime = calculateReadingTime(wordCount);

    const newDocument: NewDocument = {
      id: documentId,
      projectId,
      title,
      content: defaultContent,
      contentText,
      wordCount,
      readingTime,
      version: 1,
      isFavorite: false,
      tags: [],
      status: 'draft',
      lastEditedBy: userId,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const [insertedDoc] = await db.insert(documents).values(newDocument).returning();

    return insertedDoc;
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

export async function getDocuments(projectId: string, userId?: string) {
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

    const projectDocuments = await db
      .select({
        id: documents.id,
        title: documents.title,
        contentText: documents.contentText,
        version: documents.version,
        createdBy: documents.createdBy,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(desc(documents.updatedAt));

    return projectDocuments;
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
}

export async function getDocument(documentId: string, userId?: string) {
  try {
    const db = getDb();

    // Get document with project info
    const document = await db
      .select({
        document: documents,
        project: projects,
      })
      .from(documents)
      .leftJoin(projects, eq(documents.projectId, projects.id))
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      return null;
    }

    const docData = document[0].document;
    const projectData = document[0].project;

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
            eq(projectCollaborators.projectId, docData.projectId),
            eq(projectCollaborators.userId, userId)
          )
        )
        .limit(1);

      if (collaboration.length === 0) {
        return null; // No access
      }
    }
    // Public project - allow access regardless of authentication

    return docData;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

export async function updateDocument(
  documentId: string,
  updateData: {
    title?: string;
    contentText?: string;
    content?: any;
    isFavorite?: boolean;
    tags?: string[];
    status?: string;
  },
  userId?: string
) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Get document and check permissions
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      throw new Error('Document not found');
    }

    const docData = document[0];

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, docData.projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    const updates: any = {
      version: docData.version + 1,
      lastEditedBy: currentUserId,
      updatedAt: new Date().toISOString(),
    };

    if (updateData.title !== undefined) {
      updates.title = updateData.title;
    }

    if (updateData.content !== undefined) {
      updates.content = updateData.content;
      // Extract text content for search and calculate metrics
      const contentText = extractTextFromContent(updateData.content);
      updates.contentText = contentText;
      updates.wordCount = calculateWordCount(contentText);
      updates.readingTime = calculateReadingTime(updates.wordCount);
    }

    if (updateData.isFavorite !== undefined) {
      updates.isFavorite = updateData.isFavorite;
    }

    if (updateData.tags !== undefined) {
      updates.tags = updateData.tags;
    }

    if (updateData.status !== undefined) {
      updates.status = updateData.status;
    }

    const [updatedDoc] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, documentId))
      .returning();

    return updatedDoc;
  } catch (error) {
    console.error('Error updating document:', error);
    throw new Error('Failed to update document');
  }
}

export async function deleteDocument(documentId: string, userId: string) {
  try {
    const db = getDb();

    // Get document and check permissions
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      throw new Error('Document not found');
    }

    const docData = document[0];

    // Check if user has edit permissions
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, docData.projectId),
          eq(projectCollaborators.userId, userId)
        )
      )
      .limit(1);

    if (collaboration.length === 0 || !['owner', 'editor'].includes(collaboration[0].role)) {
      throw new Error('Insufficient permissions');
    }

    await db.delete(documents).where(eq(documents.id, documentId));

    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error('Failed to delete document');
  }
}

// Helper function to extract text from Plate.js content for search
function extractTextFromContent(content: any[]): string {
  if (!Array.isArray(content)) return '';

  return content
    .map((node) => {
      if (node.children && Array.isArray(node.children)) {
        return node.children
          .map((child: any) => child.text || '')
          .join('');
      }
      return '';
    })
    .join(' ')
    .trim();
}

// Helper function to calculate word count
function calculateWordCount(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Helper function to calculate reading time (average 200 words per minute)
function calculateReadingTime(wordCount: number): number {
  return Math.ceil(wordCount / 200);
}

export async function toggleDocumentFavorite(documentId: string, userId?: string) {
  const authUserId = await getCurrentUserId();
  const currentUserId = userId || authUserId;

  if (!currentUserId) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();

    // Get document and check permissions
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      throw new Error('Document not found');
    }

    const docData = document[0];

    // Check if user has access to the project
    const collaboration = await db
      .select()
      .from(projectCollaborators)
      .where(
        and(
          eq(projectCollaborators.projectId, docData.projectId),
          eq(projectCollaborators.userId, currentUserId)
        )
      )
      .limit(1);

    if (collaboration.length === 0) {
      throw new Error('Insufficient permissions');
    }

    const [updatedDoc] = await db
      .update(documents)
      .set({
        isFavorite: !docData.isFavorite,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(documents.id, documentId))
      .returning();

    return updatedDoc;
  } catch (error) {
    console.error('Error toggling document favorite:', error);
    throw new Error('Failed to update document favorite');
  }
}