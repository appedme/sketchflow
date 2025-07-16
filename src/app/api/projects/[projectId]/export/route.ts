import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDocuments } from '@/lib/actions/documents';
import { getCanvases } from '@/lib/actions/canvases';
import { getProject } from '@/lib/actions/projects';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Get project details
    const project = await getProject(projectId, user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get all documents and canvases
    const documents = await getDocuments(projectId, user.id);
    const canvases = await getCanvases(projectId, user.id);

    // Create export data
    const exportData = {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        visibility: project.visibility,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      documents: documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        contentText: doc.contentText,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      canvases: canvases.map(canvas => ({
        id: canvas.id,
        title: canvas.title,
        elements: canvas.elements,
        appState: canvas.appState,
        files: canvas.files,
        elementCount: canvas.elementCount,
        createdAt: canvas.createdAt,
        updatedAt: canvas.updatedAt,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
    };

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="${project.name}-export.json"`);

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}