import * as React from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { uploadImageToImgBB } from '@/lib/imageUpload';

export interface UploadedFile {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
  appUrl?: string;
}

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  onUploadBegin?: (file: File) => void;
  onUploadProgress?: (progress: number) => void;
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadBegin,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState<number>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  async function uploadFile(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    setProgress(0);

    try {
      onUploadBegin?.(file);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const newProgress = Math.min(prev + Math.random() * 15, 90);
          onUploadProgress?.(newProgress);
          return newProgress;
        });
      }, 200);

      const result = await uploadImageToImgBB(file);

      clearInterval(progressInterval);

      if (result.success && result.url) {
        const uploadedFileData: UploadedFile = {
          key: `freeimage-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: result.url,
          appUrl: result.url,
        };

        setProgress(100);
        onUploadProgress?.(100);
        setUploadedFile(uploadedFileData);
        onUploadComplete?.(uploadedFileData);

        return uploadedFileData;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      const message = errorMessage.length > 0
        ? errorMessage
        : 'Something went wrong, please try again later.';

      toast.error(message);
      onUploadError?.(error);

      throw error;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}

export function getErrorMessage(err: unknown) {
  const unknownError = 'Something went wrong, please try again later.';

  if (err instanceof z.ZodError) {
    const errors = err.issues.map((issue) => {
      return issue.message;
    });

    return errors.join('\n');
  } else if (err instanceof Error) {
    return err.message;
  } else {
    return unknownError;
  }
}

export function showErrorToast(err: unknown) {
  const errorMessage = getErrorMessage(err);

  return toast.error(errorMessage);
}
