import { NextRequest, NextResponse } from 'next/server';
import { getPublicCanvas } from '@/lib/actions/public-sharing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> }
) {
  try {
    const { canvasId } = await params;
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('shareToken');

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token required' }, { status: 400 });
    }

    const canvas = await getPublicCanvas(canvasId, shareToken);

    if (!canvas) {
      return NextResponse.json({ error: 'Canvas not found or not accessible' }, { status: 404 });
    }

    return NextResponse.json(canvas);
  } catch (error) {
    console.error('Error fetching public canvas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}