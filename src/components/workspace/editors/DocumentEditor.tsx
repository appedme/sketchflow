"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { LazyPlateEditor } from '@/components/optimized/LazyPlateEditor';

interface DocumentEditorProps {
    fileId: string;
    fileData: any;
    projectId: string;
    isReadOnly?: boolean;
    isActive?: boolean;
    onActivate?: () => void;
    onContentChange?: (updates: any) => () => void;
    onSave?: (updates: any) => Promise<void>;
}

export function DocumentEditor({
    fileId,
    fileData,
    projectId,
    isReadOnly = false,
    isActive = true,
    onActivate,
    onContentChange,
    onSave,
}: DocumentEditorProps) {
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveRef = useRef<string>('');

    // Handle document changes with debounced auto-save
    const handleDocumentChange = useCallback((content: any) => {
        if (isReadOnly) return;

        const serialized = JSON.stringify(content);

        // Skip if no actual changes
        if (serialized === lastSaveRef.current) return;

        lastSaveRef.current = serialized;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Trigger content change callback (for marking dirty)
        const cleanup = onContentChange?.({ content });

        // Auto-save after 2 seconds of inactivity
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await onSave?.({ content });
                cleanup?.(); // Clean up the auto-save timeout
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, 2000);
    }, [isReadOnly, onContentChange, onSave]);

    // Handle title changes
    const handleTitleChange = useCallback((title: string) => {
        if (isReadOnly) return;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Trigger content change callback
        const cleanup = onContentChange?.({ title });

        // Auto-save title after 1 second
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await onSave?.({ title });
                cleanup?.();
            } catch (error) {
                console.error('Title save failed:', error);
            }
        }, 1000);
    }, [isReadOnly, onContentChange, onSave]);

    // Handle manual save events
    useEffect(() => {
        const handleSaveEvent = () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            // Trigger immediate save with current data
            onSave?.(fileData);
        };

        window.addEventListener('workspace-save-all', handleSaveEvent);
        return () => {
            window.removeEventListener('workspace-save-all', handleSaveEvent);
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [onSave, fileData]);

    // Handle activation
    const handleClick = useCallback(() => {
        if (!isActive) {
            onActivate?.();
        }
    }, [isActive, onActivate]);

    // Handle workspace save events
    useEffect(() => {
        const handleWorkspaceSave = () => {
            // Trigger document save event that PlateDocumentEditor listens to
            const saveEvent = new CustomEvent('document-save-all');
            window.dispatchEvent(saveEvent);
        };

        const handleWorkspaceSaveCurrent = () => {
            if (isActive) {
                handleWorkspaceSave();
            }
        };

        window.addEventListener('workspace-save-all', handleWorkspaceSave);
        window.addEventListener('workspace-save-current', handleWorkspaceSaveCurrent);

        return () => {
            window.removeEventListener('workspace-save-all', handleWorkspaceSave);
            window.removeEventListener('workspace-save-current', handleWorkspaceSaveCurrent);
        };
    }, [isActive]);

    return (
        <div
            className="h-full w-full"
            onClick={handleClick}
        >
            <LazyPlateEditor
                documentId={fileId}
                projectId={projectId}
                projectName={fileData?.title || 'Untitled Document'}
                isReadOnly={isReadOnly}
                className="h-full"
            />
        </div>
    );
}