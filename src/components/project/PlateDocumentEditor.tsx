"use client";

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Plate, usePlateEditor, PlateContent } from 'platejs/react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import {
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { uploadImageToImgBB } from '@/lib/imageUpload';
import { useFileOperations } from '@/components/files/FileStatusIndicator';
import { useLoading } from '@/components/ui/loading-bar';

interface PlateDocumentEditorProps {
  documentId: string;
  projectId: string;
  projectName?: string;
  isReadOnly?: boolean;
  className?: string;
  shareToken?: string; // For public access
  onContentChange?: (updates: any) => () => void;
  onSave?: (updates: any) => Promise<void>;
}

interface DocumentData {
  id: string;
  title: string;
  content: any[];
  contentText: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const defaultContent = [
  {
    type: 'h1',
    children: [{ text: 'Welcome to your document!' }],
  },
  {
    type: 'p',
    children: [
      { text: 'Start writing your content here. You can use ' },
      { text: 'formatting', bold: true },
      { text: ', create ' },
      { text: 'lists', italic: true },
      { text: ', add links, and much more.' },
    ],
  },
  {
    type: 'p',
    children: [{ text: '' }],
  },
];

export function PlateDocumentEditor({
  documentId,
  projectId,
  projectName,
  isReadOnly = false,
  className,
  shareToken,
  onContentChange,
  onSave,
}: PlateDocumentEditorProps) {
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isEditing, setIsEditing] = useState(!isReadOnly);
  const [localTitle, setLocalTitle] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // File operations and loading hooks
  const { startOperation, completeOperation } = useFileOperations();
  const { startLoading, completeLoading } = useLoading();

  // Initialize editor with document content
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: document?.content || defaultContent,
    onChange: ({ value }) => {
      // Track that content has changed
      if (!isReadOnly && document) {
        const hasContentChanged = JSON.stringify(value) !== JSON.stringify(document.content);
        if (hasContentChanged) {
          setHasUnsavedChanges(true);
        }
      }
    },
  });

  // Debounce editor content changes for autosave
  const debouncedContent = useDebounce((editor as any)?.children || [], 1500);
  const debouncedTitle = useDebounce(localTitle, 800);

  // Autosave state
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [autoSaveError, setAutoSaveError] = useState<string | null>(null);

  // Load document data
  const loadDocument = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Start loading indicator
      startLoading('Loading document...', 'default');

      // Use public API if shareToken is provided (for shared content)
      const apiUrl = shareToken
        ? `/api/public/documents/${documentId}?shareToken=${shareToken}`
        : `/api/documents/${documentId}`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to load document');
      }

      const data: DocumentData = await response.json();
      setDocument(data);
      setLocalTitle(data.title);

      // Update editor content
      if (data.content && Array.isArray(data.content) && editor) {
        (editor as any).children = data.content;
      }

    } catch (err) {
      console.error('Error loading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
      completeLoading(false, 'Failed to load document');
    } finally {
      setIsLoading(false);
      completeLoading(true, 'Document loaded successfully');
    }
  }, [documentId, editor, startLoading, completeLoading]);

  // Save document changes with autosave support
  const saveDocument = useCallback(async (title?: string, content?: any[], isAutoSave = false) => {
    if (!document || isSaving || shareToken) return; // Don't save if using shareToken (public mode)

    const operationId = `save-doc-${documentId}-${Date.now()}`;

    try {
      if (isAutoSave) {
        setIsAutoSaving(true);
        setAutoSaveError(null);
      } else {
        setIsSaving(true);
        setError(null);
        // Start file operation for manual saves
        startOperation(operationId, 'saving', `Document: ${document.title}`, 'Saving document...');
      }

      const updateData: any = {};

      if (title !== undefined && title !== document.title) {
        updateData.title = title;
      }

      if (content !== undefined) {
        updateData.content = content;
        // Extract text content for search
        updateData.contentText = extractTextFromContent(content);
      }

      if (Object.keys(updateData).length === 0) {
        if (isAutoSave) {
          setIsAutoSaving(false);
        } else {
          setIsSaving(false);
        }
        return;
      }

      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      const updatedDoc: DocumentData = await response.json();
      setDocument(updatedDoc);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      if (!isAutoSave) {
        // Complete operation successfully for manual saves
        completeOperation(operationId, true, 'Document saved successfully');
      }

    } catch (err) {
      console.error('Error saving document:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save document';

      if (isAutoSave) {
        setAutoSaveError(errorMessage);
      } else {
        setError(errorMessage);
        // Complete operation with error
        completeOperation(operationId, false, 'Failed to save document');
      }
    } finally {
      if (isAutoSave) {
        setIsAutoSaving(false);
      } else {
        setIsSaving(false);
      }
    }
  }, [document, documentId, isSaving, startOperation, completeOperation]);

  // Auto-save on content changes
  useEffect(() => {
    if (!document || isReadOnly || shareToken || isAutoSaving) return; // Don't auto-save in public mode or if already saving

    if (!editor) return;

    const currentContent = (editor as any).children;
    const hasContentChanged = JSON.stringify(currentContent) !== JSON.stringify(document.content);

    if (hasContentChanged) {
      setHasUnsavedChanges(true);

      // Notify workspace of content change
      const cleanup = onContentChange?.({ content: currentContent });

      // Auto-save the document
      saveDocument(undefined, currentContent, true).then(() => {
        cleanup?.(); // Clean up after successful save
      }).catch(() => {
        cleanup?.(); // Clean up even on error
      });
    }
  }, [debouncedContent, document, editor, isReadOnly, saveDocument, isAutoSaving, onContentChange]);

  // Auto-save on title changes
  useEffect(() => {
    if (!document || isReadOnly || shareToken || !localTitle.trim() || isAutoSaving) return; // Don't auto-save in public mode or if already saving

    if (localTitle !== document.title) {
      setHasUnsavedChanges(true);

      // Notify workspace of title change
      const cleanup = onContentChange?.({ title: localTitle });

      // Auto-save the title
      saveDocument(localTitle, undefined, true).then(() => {
        cleanup?.(); // Clean up after successful save
      }).catch(() => {
        cleanup?.(); // Clean up even on error
      });
    }
  }, [debouncedTitle, document, localTitle, isReadOnly, saveDocument, isAutoSaving, onContentChange]);

  // Handle manual save
  const handleManualSave = useCallback(() => {
    if (document && editor) {
      saveDocument(localTitle, (editor as any).children, false); // false for manual save
    }
  }, [document, editor, localTitle, saveDocument]);

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Handle custom events from navigation
  useEffect(() => {
    const handleDocumentSave = () => {
      handleManualSave();
    };

    const handleFullScreen = () => {
      if (!window.document.fullscreenElement) {
        window.document.documentElement.requestFullscreen();
      } else {
        window.document.exitFullscreen();
      }
    };

    window.addEventListener('document-save-all', handleDocumentSave);
    window.addEventListener('document-fullscreen', handleFullScreen);

    return () => {
      window.removeEventListener('document-save-all', handleDocumentSave);
      window.removeEventListener('document-fullscreen', handleFullScreen);
    };
  }, [handleManualSave]);

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB');
      return;
    }

    const uploadId = `upload-img-${Date.now()}`;

    try {
      setIsUploadingImage(true);
      setError(null);

      // Start upload operation
      startOperation(uploadId, 'uploading', file.name, 'Uploading image...');

      const result = await uploadImageToImgBB(file);

      if (result.success && result.url) {
        // Insert image into editor
        const imageNode = {
          type: 'img',
          url: result.url,
          alt: file.name,
          children: [{ text: '' }],
        };

        // Insert the image at the current cursor position
        (editor as any).insertNodes([imageNode]);

        // Add a paragraph after the image
        (editor as any).insertNodes([{
          type: 'p',
          children: [{ text: '' }],
        }]);

        setHasUnsavedChanges(true);

        // Complete upload successfully
        completeOperation(uploadId, true, 'Image uploaded successfully');
      } else {
        setError(result.error || 'Failed to upload image');
        completeOperation(uploadId, false, 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image');
      completeOperation(uploadId, false, 'Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      // Reset the input
      event.target.value = '';
    }
  };

  // Extract text from Plate.js content
  const extractTextFromContent = (content: any[]): string => {
    if (!Array.isArray(content)) return '';

    return content
      .map((node) => {
        if (node.children && Array.isArray(node.children)) {
          return node.children
            .map((child: any) => child.text || '')
            .join('');
        }
        return '';
      })
      .join(' ')
      .trim();
  };

  if (isLoading) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-background", className)}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div>
            <h3 className="font-medium text-foreground">Loading document...</h3>
            <p className="text-sm text-muted-foreground">Please wait while we fetch your content</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-background p-8", className)}>
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="mt-2">
            <div className="space-y-2">
              <p className="font-medium">Failed to load document</p>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDocument}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!document) {
    return (
      <div className={cn("h-full flex items-center justify-center bg-background", className)}>
        <div className="text-center space-y-4">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-medium text-foreground">Document not found</h3>
            <p className="text-sm text-muted-foreground">The requested document could not be found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full bg-background relative", className)}>
      {/* Autosave Status Indicator */}
      {(isAutoSaving || hasUnsavedChanges || lastSaved || autoSaveError) && !isReadOnly && !shareToken && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border">
          {isAutoSaving && (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Saving...</span>
            </>
          )}
          {!isAutoSaving && hasUnsavedChanges && !autoSaveError && (
            <>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <span>Unsaved changes</span>
            </>
          )}
          {!isAutoSaving && !hasUnsavedChanges && lastSaved && !autoSaveError && (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}</span>
            </>
          )}
          {autoSaveError && (
            <>
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span className="text-red-500">Save failed</span>
            </>
          )}
        </div>
      )}

      <Plate editor={editor}>
        <EditorContainer className="h-full">
          <Editor
            variant="demo"
            readOnly={!isEditing || isReadOnly}
            className="h-full"
          />
        </EditorContainer>
      </Plate>
    </div>
  );
}