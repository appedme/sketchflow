import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCanvases } from '@/lib/actions/canvases';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Get existing canvases for this project
    const canvases = await getCanvases(projectId, userId);
    console.log('Found canvases:', canvases.length, canvases.map(c => ({ id: c.id, title: c.title })));
    
    // Find the main canvas or use the first one
    const targetCanvas = canvases.find(c => c.title === 'Main Canvas') || canvases[0];
    console.log('Target canvas:', targetCanvas ? { id: targetCanvas.id, title: targetCanvas.title, hasElements: !!targetCanvas.elements } : 'none');
    
    if (!targetCanvas) {
      return NextResponse.json({ 
        elements: [], 
        appState: {}, 
        files: {} 
      });
    }

    console.log('Returning canvas data:', {
      elementsLength: Array.isArray(targetCanvas.elements) ? targetCanvas.elements.length : 'not array',
      hasAppState: !!targetCanvas.appState,
      hasFiles: !!targetCanvas.files
    });

    return NextResponse.json({
      elements: targetCanvas.elements || [],
      appState: targetCanvas.appState || {},
      files: targetCanvas.files || {}
    });
  } catch (error) {
    console.error('Error loading canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}