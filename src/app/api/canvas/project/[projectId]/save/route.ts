import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getCanvases, updateCanvas, createCanvas } from '@/lib/actions/canvases';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: any;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
      }
      body = JSON.parse(text);
    } catch (error) {
      console.error('JSON parse error:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { elements, appState, files } = body;
    const { projectId } = await params;

    // Get existing canvases for this project
    const canvases = await getCanvases(projectId, user.id);

    // Find the main canvas or create one if none exists
    let targetCanvas = canvases.find(c => c.title === 'Main Canvas') || canvases[0];

    if (!targetCanvas) {
      // Create a new main canvas if none exists
      targetCanvas = await createCanvas(projectId, 'Main Canvas', elements, appState);
    } else {
      // Update existing canvas
      await updateCanvas(targetCanvas.id, elements, appState, files);
    }

    return NextResponse.json({
      success: true,
      canvasId: targetCanvas.id
    });
  } catch (error) {
    console.error('Error saving canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}