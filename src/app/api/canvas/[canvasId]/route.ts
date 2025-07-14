import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCanvas } from '@/lib/actions/canvases';

export async function GET(
  request: NextRequest,
  { params }: { params: { canvasId: string } }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canvas = await getCanvas(params.canvasId, userId);
    
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