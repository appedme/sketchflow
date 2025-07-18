import { NextRequest, NextResponse } from 'next/server';
import { getPublicDocument } from '@/lib/actions/public-sharing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const { searchParams } = new URL(request.url);
    const shareToken = searchParams.get('shareToken');

    if (!shareToken) {
      return NextResponse.json({ error: 'Share token required' }, { status: 400 });
    }

    const document = await getPublicDocument(documentId, shareToken);

    if (!document) {
      return NextResponse.json({ error: 'Document not found or not accessible' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Error fetching public document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}