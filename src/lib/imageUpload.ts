// Image upload utility using backend API for ImgBB with FreeImage fallback
export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
  provider?: 'imgbb' | 'freeimage';
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
}

export async function uploadImageToImgBB(file: File): Promise<ImageUploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/imgbb', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: string };
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as { success?: boolean; url?: string; provider?: string; data?: any; error?: string };

    if (result.success && result.url) {
      return {
        success: true,
        url: result.url,
        provider: result.provider as 'imgbb' | 'freeimage' | undefined,
        data: result.data,
      };
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Backend image upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Legacy function name for backward compatibility
export const uploadImageToFreeImage = uploadImageToImgBB;

export async function uploadImageFromDataURL(dataURL: string, filename: string = 'image.png'): Promise<ImageUploadResponse> {
  try {
    const response = await fetch('/api/upload/imgbb', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dataURL,
        filename,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json() as { error?: string };
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json() as { success?: boolean; url?: string; provider?: 'imgbb' | 'freeimage'; data?: any; error?: string };

    if (result.success && result.url) {
      return {
        success: true,
        url: result.url,
        provider: result.provider,
        data: result.data,
      };
    } else {
      throw new Error(result.error || 'Upload failed');
    }
  } catch (error) {
    console.error('Backend data URL upload failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadExcalidrawImage(imageData: ArrayBuffer, mimeType: string, filename: string): Promise<ImageUploadResponse> {
  try {
    // Create blob from ArrayBuffer
    const blob = new Blob([imageData], { type: mimeType });

    // Create file from blob
    const file = new File([blob], filename, { type: mimeType });

    return await uploadImageToImgBB(file);
  } catch (error) {
    console.error('Excalidraw image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload image',
    };
  }
}