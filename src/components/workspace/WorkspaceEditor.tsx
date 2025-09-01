"use client";

import React, { Suspense, memo, useCallback, useRef, useEffect } from 'react';
import { useFileData } from '@/lib/hooks/useFileData';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { Loader2 } from 'lucide-react';

// Lazy load editors but keep them mounted
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

// Minimal loading component
const Loading = memo(() => (
    <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
));

// Persistent editor wrapper that doesn't unmount
const PersistentEditor = memo(function PersistentEditor({
    fileId,
    fileType,
    projectId,
    isReadOnly,
    isActive,
    onActivate,
}: WorkspaceEditorProps) {
    const { data: fileData, error, isLoading, saveFile, autoSave } = useFileData(fileId, fileType);
    const { markFileDirty } = useWorkspaceStore();
    const saveTimeoutRef = useRef<NodeJS.Timeout>();

    const handleContentChange = useCallback((updates: any) => {
        markFileDirty(fileId, true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => autoSave(updates, 0), 2000);
    }, [fileId, markFileDirty, autoSave]);

    const handleSave = useCallback(async (updates: any) => {
        await saveFile(updates);
        markFileDirty(fileId, false);
    }, [saveFile, fileId, markFileDirty]);

    useEffect(() => () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }, []);

    if (error) return <div className="h-full flex items-center justify-center text-destructive">Error loading file</div>;
    if (!fileData && isLoading) return <Loading />;
    if (!fileData) return <Loading />;

    const props = {
        fileId,
        fileData,
        projectId,
        isReadOnly,
        isActive,
        onActivate,
        onContentChange: handleContentChange,
        onSave: handleSave,
    };

    return (
        <Suspense fallback={<Loading />}>
            {fileType === 'canvas' ? <CanvasEditor {...props} /> : <DocumentEditor {...props} />}
        </Suspense>
    );
});

// Main component that keeps all editors mounted but hidden
export const WorkspaceEditor = memo(function WorkspaceEditor({
    fileId,
    fileType,
    projectId,
    isReadOnly = false,
    isActive = true,
    onActivate,
}: WorkspaceEditorProps) {
    const { openFiles, activeFileId } = useWorkspaceStore();
    
    // Keep track of all mounted editors
    const mountedEditors = useRef<Set<string>>(new Set());
    
    // Add current file to mounted set
    useEffect(() => {
        mountedEditors.current.add(fileId);
    }, [fileId]);

    return (
        <div className="h-full w-full relative">
            {/* Render all open files but show only active one */}
            {Object.values(openFiles).map((file) => {
                const isFileActive = file.id === activeFileId;
                const shouldMount = mountedEditors.current.has(file.id) || isFileActive;
                
                if (!shouldMount) return null;
                
                return (
                    <div
                        key={file.id}
                        className="absolute inset-0"
                        style={{ 
                            display: isFileActive ? 'block' : 'none',
                            zIndex: isFileActive ? 1 : 0
                        }}
                        onClick={onActivate}
                    >
                        <PersistentEditor
                            fileId={file.id}
                            fileType={file.type}
                            projectId={projectId}
                            isReadOnly={isReadOnly}
                            isActive={isFileActive}
                            onActivate={onActivate}
                        />
                    </div>
                );
            })}
            
            {/* Fallback for when no files are open */}
            {Object.keys(openFiles).length === 0 && (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                    No files open
                </div>
            )}
        </div>
    );
});