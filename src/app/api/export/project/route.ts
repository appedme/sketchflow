import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getCurrentUserId } from '@/lib/actions/auth';
import { getDb } from '@/lib/db/connection';
import { projects, documents, canvases, files, projectCollaborators } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { serialize } from 'next-mdx-remote/serialize';
import { exportToCanvas } from '@excalidraw/excalidraw';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const db = getDb();

    // Verify user has access to this project
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId))
      .limit(1);

    if (!project.length) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const projectData = project[0];

    // Check if user is owner or collaborator
    const isOwner = projectData.ownerId === userId;
    const collaborator = await db
      .select()
      .from(projectCollaborators)
      .where(and(
        eq(projectCollaborators.projectId, projectId),
        eq(projectCollaborators.userId, userId)
      ))
      .limit(1);

    if (!isOwner && !collaborator.length) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Fetch all documents, canvases, and files for this project
    const [documentsData, canvasesData, filesData] = await Promise.all([
      db.select().from(documents).where(eq(documents.projectId, projectId)),
      db.select().from(canvases).where(eq(canvases.projectId, projectId)),
      db.select().from(files).where(eq(files.projectId, projectId))
    ]);

    // Create ZIP file
    const zip = new JSZip();

    // Add metadata.json
    const metadata = {
      project: {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        category: projectData.category,
        visibility: projectData.visibility,
        createdAt: projectData.createdAt,
        updatedAt: projectData.updatedAt,
        tags: projectData.tags,
        status: projectData.status
      },
      exportDate: new Date().toISOString(),
      version: '1.0',
      documents: documentsData.map(doc => ({
        id: doc.id,
        title: doc.title,
        wordCount: doc.wordCount,
        readingTime: doc.readingTime,
        status: doc.status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      canvases: canvasesData.map(canvas => ({
        id: canvas.id,
        title: canvas.title,
        elementCount: canvas.elementCount,
        status: canvas.status,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt
      })),
      files: filesData.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        createdAt: file.createdAt
      }))
    };

    zip.file('metadata.json', JSON.stringify(metadata, null, 2));

    // Add documents as .md files
    for (const doc of documentsData) {
      try {
        // Convert Plate.js content to markdown (simplified version)
        const content = doc.contentText || 'No content available';
        const markdownContent = `# ${doc.title}\n\n${content}\n\n---\n*Created: ${doc.createdAt}*\n*Updated: ${doc.updatedAt}*`;
        zip.file(`documents/${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, markdownContent);
      } catch (error) {
        console.error(`Error processing document ${doc.id}:`, error);
        zip.file(`documents/${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, `# ${doc.title}\n\nError processing content`);
      }
    }

    // Add canvases as .excalidraw files
    for (const canvas of canvasesData) {
      try {
        const canvasData = {
          type: 'excalidraw',
          version: 2,
          source: 'sketchflow',
          elements: canvas.elements,
          appState: canvas.appState,
          files: canvas.files
        };
        zip.file(`canvases/${canvas.title.replace(/[^a-zA-Z0-9]/g, '_')}.excalidraw`, JSON.stringify(canvasData, null, 2));
      } catch (error) {
        console.error(`Error processing canvas ${canvas.id}:`, error);
        zip.file(`canvases/${canvas.title.replace(/[^a-zA-Z0-9]/g, '_')}.excalidraw`, JSON.stringify({ error: 'Failed to export canvas' }));
      }
    }

    // Generate ZIP file
    const zipContent = await zip.generateAsync({ type: 'uint8array' });

    // Return ZIP file as response
    const safeProjectName = projectData.name.replace(/[^a-zA-Z0-9]/g, '_');
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeProjectName}_export.zip"`,
      },
    });

  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}