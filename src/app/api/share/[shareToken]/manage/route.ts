import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateShareSettings, deleteShare } from '@/lib/actions/sharing';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareToken } = await params;
    const body: any = await request.json();
    const { settings } = body;

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token required' }, { status: 400 });
    }

    const result = await updateShareSettings(shareToken, settings, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shareToken } = await params;

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token required' }, { status: 400 });
    }

    const result = await deleteShare(shareToken, userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}