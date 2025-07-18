"use server";

import { getDb } from '@/lib/db/connection';
import { shares, projects, documents, canvases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Public functions that don't require authentication for shared content

export async function getPublicProject(shareToken: string) {
  try {
    const db = getDb();

    // Get share data
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

    // Get project data (only for public projects)
    if (shareData.projectId) {
      const project = await db
        .select()
        .from(projects)
        .where(eq(projects.id, shareData.projectId))
        .limit(1);

      if (project.length === 0 || project[0].visibility !== 'public') {
        return null;
      }

      // Get project documents and canvases
      const projectDocs = await db
        .select()
        .from(documents)
        .where(eq(documents.projectId, shareData.projectId));

      const projectCanvases = await db
        .select()
        .from(canvases)
        .where(eq(canvases.projectId, shareData.projectId));

      return {
        ...project[0],
        documents: projectDocs,
        canvases: projectCanvases
      };
    }

    // Handle individual document/canvas shares (for future use)
    if (shareData.documentId) {
      const document = await db
        .select()
        .from(documents)
        .where(eq(documents.id, shareData.documentId))
        .limit(1);

      return document.length > 0 ? document[0] : null;
    }

    if (shareData.canvasId) {
      const canvas = await db
        .select()
        .from(canvases)
        .where(eq(canvases.id, shareData.canvasId))
        .limit(1);

      return canvas.length > 0 ? canvas[0] : null;
    }

    return null;
  } catch (error) {
    console.error('Error fetching public project:', error);
    return null;
  }
}

export async function getPublicDocument(documentId: string, shareToken: string) {
  try {
    const db = getDb();

    // Verify the share token is valid and the document belongs to a public project
    const share = await db
      .select()
      .from(shares)
      .where(eq(shares.shareToken, shareToken))
      .limit(1);

    if (share.length === 0) {
      return null;
    }

    const shareData = share[0];

    // Get the document
    const document = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (document.length === 0) {
      return null;
    }

    const docData = document[0];

    // Verify the document belongs to the shared project
    if (shareData.projectId !== docData.projectId) {
      return null;
    }

    // Verify the project is public
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, docData.projectId))
      .limit(1);

    if (project.length === 0 || project[0].visibility !== 'public') {
      return null;
    }

    return docData;
  } catch (error) {
    console.error('Error fetching public document:', error);
    return null;
  }
}

export async function getPublicCanvas(canvasId: string, shareToken: string) {
  try {
    const db = getDb();

    // Verify the share token is valid and the canvas belongs to a public project
    const share = await db
      .select()
      .from(shares)
      .where(eq(shares.shareToken, shareToken))
      .limit(1);

    if (share.length === 0) {
      return null;
    }

    const shareData = share[0];

    // Get the canvas
    const canvas = await db
      .select()
      .from(canvases)
      .where(eq(canvases.id, canvasId))
      .limit(1);

    if (canvas.length === 0) {
      return null;
    }

    const canvasData = canvas[0];

    // Verify the canvas belongs to the shared project
    if (shareData.projectId !== canvasData.projectId) {
      return null;
    }

    // Verify the project is public
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, canvasData.projectId))
      .limit(1);

    if (project.length === 0 || project[0].visibility !== 'public') {
      return null;
    }

    return canvasData;
  } catch (error) {
    console.error('Error fetching public canvas:', error);
    return null;
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

    return share[0];
  } catch (error) {
    console.error('Error fetching share:', error);
    return null;
  }
}