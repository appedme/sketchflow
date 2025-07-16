import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getFileContent } from '@/lib/actions/files';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileId } = await params;
    const fileData = await getFileContent(fileId, user.id);

    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Return file content with proper headers
    return new NextResponse(fileData.content, {
      headers: {
        'Content-Type': fileData.metadata.contentType,
        'Content-Disposition': `attachment; filename="${fileData.metadata.fileName}"`,
        'Content-Length': fileData.metadata.fileSize.toString(),
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}