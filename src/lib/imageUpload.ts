// Image upload utility using ImgBB API with FreeImage fallback
const IMGBB_API_KEY = 'e066f689cd06a7f0e4bda84e7d791b21';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';

// Fallback to FreeImage.host
const FREEIMAGE_API_KEY = '6d207e02198a847aa98d0a2a901485a5';
const FREEIMAGE_API_URL = 'https://freeimage.host/api/1/upload';

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
    // Convert file to base64
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

    const result = await response.json() as any;

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
    console.warn('ImgBB upload failed, trying FreeImage fallback:', error);

    // Fallback to FreeImage.host
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
          provider: 'freeimage',
        };
      } else {
        throw new Error(data.error?.message || 'FreeImage upload failed');
      }
    } catch (fallbackError) {
      console.error('Both ImgBB and FreeImage upload failed:', fallbackError);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

// Legacy function name for backward compatibility
export const uploadImageToFreeImage = uploadImageToImgBB;

export async function uploadImageFromDataURL(dataURL: string, filename: string = 'image.png'): Promise<ImageUploadResponse> {
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

    const result = await response.json() as any;

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
    console.warn('ImgBB data URL upload failed, trying FreeImage fallback:', error);

    // Fallback: Convert data URL to file and use FreeImage
    try {
      const response = await fetch(dataURL);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: blob.type });

      const formData = new FormData();
      formData.append('key', FREEIMAGE_API_KEY);
      formData.append('source', file);
      formData.append('format', 'json');

      const uploadResponse = await fetch(FREEIMAGE_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP error! status: ${uploadResponse.status}`);
      }

      const data = await uploadResponse.json() as any;

      if (data.success && data.image && data.image.url) {
        return {
          success: true,
          url: data.image.url,
          provider: 'freeimage',
        };
      } else {
        throw new Error(data.error?.message || 'FreeImage upload failed');
      }
    } catch (fallbackError) {
      console.error('Both ImgBB and FreeImage data URL upload failed:', fallbackError);
      return {
        success: false,
        error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
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