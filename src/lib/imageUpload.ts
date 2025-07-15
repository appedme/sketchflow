// Image upload utility for Excalidraw using FreeImage.host API
const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5';
const FREEIMAGE_API_URL = 'https://freeimage.host/api/1/upload';

export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadImageToFreeImage(file: File): Promise<ImageUploadResponse> {
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

    const data = await response.json() as any;

    if (data.success && data.image && data.image.url) {
      return {
        success: true,
        url: data.image.url,
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Upload failed',
      };
    }
  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadImageFromDataURL(dataURL: string, filename: string = 'image.png'): Promise<ImageUploadResponse> {
  try {
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();

    // Create file from blob
    const file = new File([blob], filename, { type: blob.type });

    return await uploadImageToFreeImage(file);
  } catch (error) {
    console.error('Data URL conversion error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to convert image',
    };
  }
}

export async function uploadExcalidrawImage(imageData: ArrayBuffer, mimeType: string, filename: string): Promise<ImageUploadResponse> {
  try {
    // Create blob from ArrayBuffer
    const blob = new Blob([imageData], { type: mimeType });

    // Create file from blob
    const file = new File([blob], filename, { type: mimeType });

    return await uploadImageToFreeImage(file);
  } catch (error) {
    console.error('Excalidraw image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}