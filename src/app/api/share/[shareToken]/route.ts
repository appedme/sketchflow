import { NextRequest, NextResponse } from 'next/server';
import { getShare, getPublicProject } from '@/lib/actions/public-sharing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token required' }, { status: 400 });
    }

    const shareData = await getShare(shareToken);

    if (!shareData) {
      return NextResponse.json({ error: 'Share not found or expired' }, { status: 404 });
    }

    // Get the actual shared content
    const publicData = await getPublicProject(shareToken);

    return NextResponse.json({
      share: shareData,
      data: publicData
    });
  } catch (error) {
    console.error('Error fetching share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}