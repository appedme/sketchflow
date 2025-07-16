import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getCanvas } from '@/lib/actions/canvases';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvasId } = await params;

    // Get the specific canvas
    const canvas = await getCanvas(canvasId, user.id);
    console.log('Found canvas:', canvas ? { id: canvas.id, title: canvas.title, hasElements: !!canvas.elements } : 'none');

    if (!canvas) {
      return NextResponse.json({
        elements: [],
        appState: {},
        files: {}
      });
    }

    console.log('Returning canvas data:', {
      elementsLength: Array.isArray(canvas.elements) ? canvas.elements.length : 'not array',
      hasAppState: !!canvas.appState,
      hasFiles: !!canvas.files
    });

    return NextResponse.json({
      elements: canvas.elements || [],
      appState: canvas.appState || {},
      files: canvas.files || {}
    });
  } catch (error) {
    console.error('Error loading canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
