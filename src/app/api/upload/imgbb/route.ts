import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/actions/auth';

// ImgBB API configuration
const IMGBB_API_KEY = process.env.IMGBB_API_KEY || 'ecb9e62cf80a303d0b1f73ca00f30494';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

// FreeImage fallback configuration
const FREEIMAGE_API_KEY = process.env.FREEIMAGE_API_KEY || '6d207e02198a847aa98d0a2a901485a5';
const FREEIMAGE_API_URL = 'https://freeimage.host/api/1/upload';

interface ImgBBResponse {
    success: boolean;
    data?: {
        id: string;
        title: string;
        url_viewer: string;
        url: string;
        display_url: string;
        width: string;
        height: string;
        size: string;
        time: string;
        expiration: string;
    };
    error?: {
        message: string;
        code: number;
    };
}

interface ImageUploadResponse {
    success: boolean;
    url?: string;
    error?: string;
    provider?: 'imgbb' | 'freeimage';
    data?: any;
}

// Helper function to convert file to base64
async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
}

// Upload to ImgBB
async function uploadToImgBB(file: File): Promise<ImageUploadResponse> {
    try {
        const base64 = await fileToBase64(file);

        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64);
        formData.append('name', file.name);

        const response = await fetch(IMGBB_API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ImgBBResponse = await response.json();

        if (result.success && result.data && result.data.url) {
            return {
                success: true,
                url: result.data.url,
                provider: 'imgbb',
                data: result.data,
            };
        } else {
            throw new Error(result.error?.message || 'ImgBB upload failed');
        }
    } catch (error) {
        console.warn('ImgBB upload failed:', error);
        throw error;
    }
}

// Upload to FreeImage (fallback)
async function uploadToFreeImage(file: File): Promise<ImageUploadResponse> {
    try {
        const formData = new FormData();
        formData.append('key', FREEIMAGE_API_KEY);
        formData.append('source', file);
        formData.append('format', 'json');

        const response = await fetch(FREEIMAGE_API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.image && data.image.url) {
            return {
                success: true,
                url: data.image.url,
                provider: 'freeimage',
            };
        } else {
            throw new Error(data.error?.message || 'FreeImage upload failed');
        }
    } catch (error) {
        console.error('FreeImage upload failed:', error);
        throw error;
    }
}

// Upload with fallback
async function uploadImageWithFallback(file: File): Promise<ImageUploadResponse> {
    try {
        // Try ImgBB first
        return await uploadToImgBB(file);
    } catch (imgbbError) {
        console.warn('ImgBB failed, trying FreeImage fallback:', imgbbError);

        try {
            // Fallback to FreeImage
            return await uploadToFreeImage(file);
        } catch (freeImageError) {
            console.error('Both ImgBB and FreeImage failed:', freeImageError);
            return {
                success: false,
                error: `Upload failed: ${imgbbError instanceof Error ? imgbbError.message : 'Unknown error'}`,
            };
        }
    }
}

// Handle data URL uploads
async function uploadDataURLWithFallback(dataURL: string, filename: string): Promise<ImageUploadResponse> {
    try {
        // Extract base64 data from data URL
        const base64Data = dataURL.split(',')[1];

        const formData = new FormData();
        formData.append('key', IMGBB_API_KEY);
        formData.append('image', base64Data);
        formData.append('name', filename);

        const response = await fetch(IMGBB_API_URL, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ImgBBResponse = await response.json();

        if (result.success && result.data && result.data.url) {
            return {
                success: true,
                url: result.data.url,
                provider: 'imgbb',
                data: result.data,
            };
        } else {
            throw new Error(result.error?.message || 'ImgBB upload failed');
        }
    } catch (imgbbError) {
        console.warn('ImgBB data URL upload failed, trying FreeImage fallback:', imgbbError);

        try {
            // Convert data URL to file for FreeImage
            const response = await fetch(dataURL);
            const blob = await response.blob();
            const file = new File([blob], filename, { type: blob.type });

            return await uploadToFreeImage(file);
        } catch (freeImageError) {
            console.error('Both ImgBB and FreeImage data URL upload failed:', freeImageError);
            return {
                success: false,
                error: `Upload failed: ${imgbbError instanceof Error ? imgbbError.message : 'Unknown error'}`,
            };
        }
    }
}

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

            // Validate file size (max 32MB for ImgBB)
            if (file.size > 32 * 1024 * 1024) {
                return NextResponse.json({ error: 'File size must be less than 32MB' }, { status: 400 });
            }

            const result = await uploadImageWithFallback(file);

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    url: result.url,
                    provider: result.provider,
                    data: result.data,
                    message: `Image uploaded successfully via ${result.provider}`
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

            const result = await uploadDataURLWithFallback(dataURL, filename || 'image.png');

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    url: result.url,
                    provider: result.provider,
                    data: result.data,
                    message: `Image uploaded successfully via ${result.provider}`
                });
            } else {
                return NextResponse.json({
                    error: result.error || 'Upload failed'
                }, { status: 500 });
            }
        }
    } catch (error) {
        console.error('ImgBB upload API error:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}