import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getCanvases, createCanvas } from '@/lib/actions/canvases';

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
    const canvases = await getCanvases(projectId, userId);

    return NextResponse.json(canvases);
  } catch (error) {
    console.error('Error fetching canvases:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const body: any = await request.json();
    const { title, elements, appState, files } = body;

    const canvas = await createCanvas(projectId, title, elements, appState, files, userId);

    return NextResponse.json(canvas, { status: 201 });
  } catch (error) {
    console.error('Error creating canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}