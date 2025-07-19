import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDb } from '@/lib/db/connection';
import { projects, documents, canvases, projectCollaborators } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const db = getDb();

    // Get the original project
    const originalProject = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (originalProject.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = originalProject[0];

    // Check if project is public or user has access
    if (project.visibility !== 'public') {
      // Check if user has access to the project
      const collaboration = await db
        .select()
        .from(projectCollaborators)
        .where(eq(projectCollaborators.projectId, projectId))
        .where(eq(projectCollaborators.userId, user.id))
        .limit(1);

      if (collaboration.length === 0) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Create new project ID
    const newProjectId = nanoid();

    // Clone the project
    const clonedProject = {
      id: newProjectId,
      name: `${project.name} (Copy)`,
      description: project.description,
      category: project.category,
      visibility: 'private', // Always make clones private initially
      templateId: project.templateId,
      ownerId: user.id,
      thumbnailUrl: project.thumbnailUrl,
      settings: project.settings,
      viewCount: 0,
      isFavorite: false,
      tags: project.tags,
      status: 'active',
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert cloned project
    await db.insert(projects).values(clonedProject);

    // Add owner as collaborator
    await db.insert(projectCollaborators).values({
      id: nanoid(),
      projectId: newProjectId,
      userId: user.id,
      role: 'owner',
      invitedBy: user.id,
      invitedAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
    });

    // Clone documents
    const originalDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId));

    for (const doc of originalDocuments) {
      await db.insert(documents).values({
        id: nanoid(),
        projectId: newProjectId,
        title: doc.title,
        content: doc.content,
        contentText: doc.contentText,
        wordCount: doc.wordCount,
        readingTime: doc.readingTime,
        version: 1,
        isFavorite: false,
        tags: doc.tags,
        status: 'draft',
        lastEditedBy: user.id,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Clone canvases
    const originalCanvases = await db
      .select()
      .from(canvases)
      .where(eq(canvases.projectId, projectId));

    for (const canvas of originalCanvases) {
      await db.insert(canvases).values({
        id: nanoid(),
        projectId: newProjectId,
        title: canvas.title,
        elements: canvas.elements,
        appState: canvas.appState,
        files: canvas.files,
        elementCount: canvas.elementCount,
        version: 1,
        isFavorite: false,
        tags: canvas.tags,
        status: 'draft',
        lastEditedBy: user.id,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      projectId: newProjectId,
      message: 'Project cloned successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error cloning project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}