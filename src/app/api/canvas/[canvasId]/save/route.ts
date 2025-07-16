import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { updateCanvas } from '@/lib/actions/canvases';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
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
    await updateCanvas(canvasId, elements, appState, files, user.id);

    return NextResponse.json({
      success: true,
      canvasId
    });
  } catch (error) {
    console.error('Error saving canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
