"use server";

import { auth } from '@clerk/nextjs/server';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/connection';
import { documents, projects, projectCollaborators, type NewDocument } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createDocument(projectId: string, title: string, content?: any) {
  const { userId } = await auth();
  
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
        type: 'p',
        children: [{ text: '' }],
      }
    ];

    // Extract text content for search
    const contentText = extractTextFromContent(defaultContent);

    const newDocument: NewDocument = {
      id: documentId,
      projectId,
      title,
      content: defaultContent,
      contentText,
      version: 1,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(documents).values(newDocument);

    return { success: true, documentId };
  } catch (error) {
    console.error('Error creating document:', error);
    throw new Error('Failed to create document');
  }
}

export async function getDocuments(projectId: string, userId: string) {
  try {
    const db = getDb();
    
    // Check if user has access to the project
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

export async function getDocument(documentId: string, userId: string) {
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

    return docData;
  } catch (error) {
    console.error('Error fetching document:', error);
    return null;
  }
}

export async function updateDocument(documentId: string, updateData: { title?: string; contentText?: string; content?: any }, userId?: string) {
  const { userId: authUserId } = await auth();
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
      updatedAt: new Date().toISOString(),
    };

    if (updateData.title !== undefined) {
      updates.title = updateData.title;
    }

    if (updateData.contentText !== undefined) {
      updates.contentText = updateData.contentText;
    }

    if (updateData.content !== undefined) {
      updates.content = updateData.content;
      // Extract text content for search if content is provided
      updates.contentText = extractTextFromContent(updateData.content);
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