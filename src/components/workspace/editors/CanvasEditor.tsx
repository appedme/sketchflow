"use client";

import React, { useEffect, useCallback } from 'react';
import { LazyExcalidrawCanvas } from '@/components/optimized/LazyExcalidrawCanvas';

interface CanvasEditorProps {
    fileId: string;
    fileData: any;
    projectId: string;
    isReadOnly?: boolean;
    isActive?: boolean;
    onActivate?: () => void;
    onContentChange?: (updates: any) => () => void;
    onSave?: (updates: any) => Promise<void>;
}

export function CanvasEditor({
    fileId,
    fileData,
    projectId,
    isReadOnly = false,
    isActive = true,
    onActivate,
}: CanvasEditorProps) {
    // Handle activation
    const handleClick = useCallback(() => {
        if (!isActive) {
            onActivate?.();
        }
    }, [isActive, onActivate]);

    // Bridge Workspace save events to Excalidraw canvas save
    useEffect(() => {
        const triggerCanvasSave = () => {
            const saveEvent = new CustomEvent('excalidraw-save');
            window.dispatchEvent(saveEvent);
        };

        const handleWorkspaceSaveAll = () => {
            triggerCanvasSave();
        };

        const handleWorkspaceSaveCurrent = () => {
            if (isActive) {
                triggerCanvasSave();
            }
        };

        window.addEventListener('workspace-save-all', handleWorkspaceSaveAll);
        window.addEventListener('workspace-save-current', handleWorkspaceSaveCurrent);
        return () => {
            window.removeEventListener('workspace-save-all', handleWorkspaceSaveAll);
            window.removeEventListener('workspace-save-current', handleWorkspaceSaveCurrent);
        };
    }, [isActive]);

    return (
        <div className="h-full w-full" onClick={handleClick}>
            <LazyExcalidrawCanvas
                projectId={projectId}
                projectName={fileData?.title || 'Canvas'}
                canvasId={fileId}
                isReadOnly={isReadOnly}
            />
        </div>
    );
}
