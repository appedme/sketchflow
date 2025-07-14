import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCanvases, updateCanvas, createCanvas } from '@/lib/actions/canvases';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { elements, appState, files } = await request.json();
    const { projectId } = await params;

    // Get existing canvases for this project
    const canvases = await getCanvases(projectId, userId);
    
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