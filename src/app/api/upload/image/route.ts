import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/actions/auth';
import { uploadImageToFreeImage, uploadImageFromDataURL } from '@/lib/imageUpload';

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 });
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
      }

      const result = await uploadImageToFreeImage(file);

      if (result.success) {
        return NextResponse.json({
          success: true,
          url: result.url,
          message: 'Image uploaded successfully'
        });
      } else {
        return NextResponse.json({
          error: result.error || 'Upload failed'
        }, { status: 500 });
      }
    } else {
      // Handle data URL upload
      const body = await request.json() as { dataURL?: string; filename?: string };
      const { dataURL, filename } = body;

      if (!dataURL) {
        return NextResponse.json({ error: 'No image data provided' }, { status: 400 });
      }

      const result = await uploadImageFromDataURL(dataURL, filename || 'image.png');

      if (result.success) {
        return NextResponse.json({
          success: true,
          url: result.url,
          message: 'Image uploaded successfully'
        });
      } else {
        return NextResponse.json({
          error: result.error || 'Upload failed'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('Image upload API error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}