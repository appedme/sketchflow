import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getCanvas, updateCanvasMetadata, deleteCanvas } from '@/lib/actions/canvases';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    const { canvasId } = await params;

    // Allow access for authenticated users or public projects
    const canvas = await getCanvas(canvasId, user?.id);

    if (!canvas) {
      return NextResponse.json({ error: 'Canvas not found' }, { status: 404 });
    }

    return NextResponse.json({
      elements: canvas.elements || [],
      appState: canvas.appState || {},
      files: canvas.files || {}
    });
  } catch (error) {
    console.error('Error fetching canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvasId } = await params;
    const body = await request.json() as {
      title?: string;
      elements?: any[];
      appState?: any;
      files?: any;
    };
    const { title, elements, appState, files } = body;

    const updatedCanvas = await updateCanvasMetadata(canvasId, {
      title,
      elements,
      appState,
      files
    }, user.id);

    return NextResponse.json(updatedCanvas);
  } catch (error) {
    console.error('Error updating canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvasId } = await params;
    const result = await deleteCanvas(canvasId, user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}