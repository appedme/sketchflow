import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDocuments, createDocument } from '@/lib/actions/documents';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    const { projectId } = await params;

    // Allow access for authenticated users or public projects
    const documents = await getDocuments(projectId, user?.id);

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    
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
    const { title, content, contentText } = body;

    const document = await createDocument(projectId, title, content);

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}