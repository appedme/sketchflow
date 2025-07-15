import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCanvas, updateCanvasMetadata } from '@/lib/actions/canvases';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvasId } = await params;
    const canvas = await getCanvas(canvasId, userId);
    
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvasId } = await params;
    const { title, elements, appState, files } = await request.json();

    const updatedCanvas = await updateCanvasMetadata(canvasId, {
      title,
      elements,
      appState,
      files
    }, userId);

    return NextResponse.json(updatedCanvas);
  } catch (error) {
    console.error('Error updating canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}