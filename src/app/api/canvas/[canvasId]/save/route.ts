import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateCanvas } from '@/lib/actions/canvases';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestData = await request.json() as {
      elements: any[];
      appState: any;
      files: any;
    };
    const { elements, appState, files } = requestData;
    const { canvasId } = await params;

    // Update the specific canvas
    await updateCanvas(canvasId, elements, appState, files, userId);

    return NextResponse.json({ 
      success: true, 
      canvasId 
    });
  } catch (error) {
    console.error('Error saving canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
