import { useCallback } from 'react';
import { uploadImageToFreeImage, uploadImageFromDataURL } from '@/lib/imageUpload';

export function useImageUpload() {
  const uploadFile = useCallback(async (file: File) => {
    try {
      const result = await uploadImageToFreeImage(file);
      
      if (result.success && result.url) {
        return {
          success: true,
          url: result.url,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      
      // Fallback to data URL
      const dataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      return {
        success: false,
        url: dataURL,
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  const uploadDataURL = useCallback(async (dataURL: string, filename?: string) => {
    try {
      const result = await uploadImageFromDataURL(dataURL, filename);
      
      if (result.success && result.url) {
        return {
          success: true,
          url: result.url,
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Data URL upload error:', error);
      
      return {
        success: false,
        url: dataURL,
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, []);

  return {
    uploadFile,
    uploadDataURL
  };
}