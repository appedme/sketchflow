"use client";

import React, { Suspense, useMemo, useCallback, memo } from 'react';
import { useFileData } from '@/lib/hooks/useFileData';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Lazy load editors with better chunking
const CanvasEditor = React.lazy(() =>
    import('./editors/CanvasEditor').then(mod => ({ default: mod.CanvasEditor }))
);

const DocumentEditor = React.lazy(() =>
    import('./editors/DocumentEditor').then(mod => ({ default: mod.DocumentEditor }))
);

interface WorkspaceEditorProps {
    fileId: string;
    fileType: 'canvas' | 'document';
    projectId: string;
    isReadOnly?: boolean;
    isActive?: boolean;
    onActivate?: () => void;
}

// Loading component
function EditorLoading({ fileType }: { fileType: 'canvas' | 'document' }) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <div>
                    <h3 className="font-medium">Loading {fileType === 'canvas' ? 'Canvas' : 'Document'}</h3>
                    <p className="text-sm text-muted-foreground">
                        {fileType === 'canvas' ? 'Preparing drawing tools...' : 'Loading rich text editor...'}
                    </p>
                </div>
            </div>
        </div>
    );
}

// Error component
function EditorError({
    error,
    onRetry,
    fileType
}: {
    error: Error;
    onRetry: () => void;
    fileType: 'canvas' | 'document';
}) {
    return (
        <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="text-center space-y-4 max-w-md">
                <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
                <div>
                    <h3 className="font-semibold mb-2">
                        Failed to Load {fileType === 'canvas' ? 'Canvas' : 'Document'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                </div>
                <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}

const WorkspaceEditorComponent = memo(function WorkspaceEditor({
    fileId,
    fileType,
    projectId,
    isReadOnly = false,
    isActive = true,
    onActivate,
}: WorkspaceEditorProps) {
    const { data: fileData, error, isLoading, saveFile, autoSave } = useFileData(fileId, fileType);
    const { markFileDirty } = useWorkspaceStore();

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
        console.log('WorkspaceEditor render:', {
            fileId,
            fileType,
            hasData: !!fileData,
            isLoading,
            error: error?.message,
        });
    }

    // Handle content changes with auto-save
    const handleContentChange = useCallback((updates: any) => {
        // Mark file as dirty immediately
        markFileDirty(fileId, true);

        // Auto-save after 2 seconds of inactivity
        return autoSave(updates, 2000);
    }, [fileId, markFileDirty, autoSave]);

    // Handle manual save
    const handleSave = useCallback(async (updates: any) => {
        try {
            await saveFile(updates);
            markFileDirty(fileId, false);
        } catch (error) {
            console.error('Save failed:', error);
        }
    }, [saveFile, fileId, markFileDirty]);

    // Retry function
    const handleRetry = useCallback(() => {
        window.location.reload();
    }, []);

    // Memoized editor component
    const EditorComponent = useMemo(() => {
        if (error) {
            return (
                <EditorError
                    error={error}
                    onRetry={handleRetry}
                    fileType={fileType}
                />
            );
        }

        // Only show loading for initial load, not when switching files
        if (!fileData && isLoading) {
            return <EditorLoading fileType={fileType} />;
        }

        // If we have cached data, show it immediately even while loading fresh data
        if (!fileData) {
            return <EditorLoading fileType={fileType} />;
        }

        const commonProps = {
            fileId,
            fileData,
            projectId,
            isReadOnly,
            isActive,
            onActivate,
            onContentChange: handleContentChange,
            onSave: handleSave,
        };

        if (fileType === 'canvas') {
            return (
                <Suspense fallback={<EditorLoading fileType="canvas" />}>
                    <CanvasEditor {...commonProps} />
                </Suspense>
            );
        } else {
            return (
                <Suspense fallback={<EditorLoading fileType="document" />}>
                    <DocumentEditor {...commonProps} />
                </Suspense>
            );
        }
    }, [
        fileType,
        fileId,
        fileData,
        isLoading,
        error,
        projectId,
        isReadOnly,
        isActive,
        onActivate,
        handleContentChange,
        handleSave,
        handleRetry,
    ]);

    return (
        <div
            className="h-full w-full"
            onClick={onActivate}
        >
            {EditorComponent}
        </div>
    );
});

export const WorkspaceEditor = WorkspaceEditorComponent;
