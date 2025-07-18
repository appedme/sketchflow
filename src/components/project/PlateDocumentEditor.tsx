"use client";

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Plate, usePlateEditor, PlateContent } from 'platejs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import {
  Save,
  Edit3,
  Eye,
  ChevronDown,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Image,
  Upload,
  Maximize2
} from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { uploadImageToFreeImage } from '@/lib/imageUpload';

interface PlateDocumentEditorProps {
  documentId: string;
  projectId: string;
  projectName?: string;
  isReadOnly?: boolean;
  className?: string;
  shareToken?: string; // For public access
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

  // Initialize editor with document content
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: document?.content || defaultContent,
  });

  // Debounce editor content changes
  const debouncedContent = useDebounce((editor as any)?.children || [], 2000);
  const debouncedTitle = useDebounce(localTitle, 1000);

  // Load document data
  const loadDocument = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

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
    } finally {
      setIsLoading(false);
    }
  }, [documentId, editor]);

  // Save document changes
  const saveDocument = useCallback(async (title?: string, content?: any[]) => {
    if (!document || isSaving || shareToken) return; // Don't save if using shareToken (public mode)

    try {
      setIsSaving(true);
      setError(null);

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
        setIsSaving(false);
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

    } catch (err) {
      console.error('Error saving document:', err);
      setError(err instanceof Error ? err.message : 'Failed to save document');
    } finally {
      setIsSaving(false);
    }
  }, [document, documentId, isSaving]);

  // Auto-save on content changes
  useEffect(() => {
    if (!document || isReadOnly || shareToken) return; // Don't auto-save in public mode

    if (!editor) return;

    const currentContent = (editor as any).children;
    const hasContentChanged = JSON.stringify(currentContent) !== JSON.stringify(document.content);

    if (hasContentChanged) {
      setHasUnsavedChanges(true);
      saveDocument(undefined, currentContent);
    }
  }, [debouncedContent, document, editor, isReadOnly, saveDocument]);

  // Auto-save on title changes
  useEffect(() => {
    if (!document || isReadOnly || shareToken || !localTitle.trim()) return; // Don't auto-save in public mode

    if (localTitle !== document.title) {
      setHasUnsavedChanges(true);
      saveDocument(localTitle);
    }
  }, [debouncedTitle, document, localTitle, isReadOnly, saveDocument]);

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Handle manual save
  const handleManualSave = () => {
    if (document && editor) {
      saveDocument(localTitle, (editor as any).children);
    }
  };

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

    try {
      setIsUploadingImage(true);
      setError(null);

      const result = await uploadImageToFreeImage(file);

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
      } else {
        setError(result.error || 'Failed to upload image');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Failed to upload image');
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
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-card">
        <div className="p-4 space-y-4">
          {/* Title and Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              {isEditing && !isReadOnly ? (
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="text-xl font-semibold border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
                  placeholder="Document title..."
                />
              ) : (
                <h1 className="text-xl font-semibold text-foreground truncate">
                  {document.title}
                </h1>
              )}

              {/* Document Info */}
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>Version {document.version}</span>
                </div>
                <Separator orientation="vertical" className="h-3" />
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {lastSaved
                      ? `Saved ${formatDistanceToNow(lastSaved, { addSuffix: true })}`
                      : `Updated ${formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}`
                    }
                  </span>
                </div>
                {projectName && (
                  <>
                    <Separator orientation="vertical" className="h-3" />
                    <span>{projectName}</span>
                  </>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Save Status */}
              {isSaving ? (
                <Badge variant="secondary" className="gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Saving...
                </Badge>
              ) : hasUnsavedChanges ? (
                <Badge variant="outline" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved
                </Badge>
              ) : lastSaved ? (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Saved
                </Badge>
              ) : null}

              {/* Mode Toggle */}
              {!isReadOnly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      {isEditing ? (
                        <>
                          <Edit3 className="w-4 h-4" />
                          Edit Mode
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          View Mode
                        </>
                      )}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      disabled={isEditing}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Mode
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsEditing(false)}
                      disabled={!isEditing}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Mode
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Full Screen Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const documentElement = window.document.documentElement;
                  if (!window.document.fullscreenElement) {
                    documentElement.requestFullscreen().catch(err => {
                      console.error(`Error attempting to enable full-screen mode: ${err.message}`);
                    });
                  } else {
                    window.document.exitFullscreen();
                  }
                }}
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>



              {/* Manual Save */}
              {isEditing && !isReadOnly && (
                <Button
                  size="sm"
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
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
    </div>
  );
}