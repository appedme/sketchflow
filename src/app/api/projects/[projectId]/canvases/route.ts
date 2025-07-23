import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getCanvases, createCanvas } from '@/lib/actions/canvases';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    const { projectId } = await params;

    // Allow access for authenticated users or public projects
    const canvases = await getCanvases(projectId, user?.id);

    return NextResponse.json(canvases);
  } catch (error) {
    console.error('Error fetching canvases:', error);
    
    // If access denied and no user, return 401, otherwise 403
    if (error instanceof Error && error.message.includes('Access denied')) {
      const user = await stackServerApp.getUser();
      return NextResponse.json(
        { error: 'Access denied' }, 
        { status: user ? 403 : 401 }
      );
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const body: any = await request.json();
    const { title, elements, appState, files } = body;

    const canvas = await createCanvas(projectId, title, elements, appState, files, user.id);

    return NextResponse.json(canvas, { status: 201 });
  } catch (error) {
    console.error('Error creating canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}