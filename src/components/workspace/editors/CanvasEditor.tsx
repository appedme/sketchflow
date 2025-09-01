"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { EnhancedExcalidrawCanvas } from '@/components/canvas/EnhancedExcalidrawCanvas';
import { CanvasProvider } from '@/contexts/CanvasContext';

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
    onContentChange,
    onSave,
}: CanvasEditorProps) {
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSaveRef = useRef<string>('');

    // Handle canvas changes with debounced auto-save
    const handleCanvasChange = useCallback((elements: any[], appState: any) => {
        if (isReadOnly) return;

        const serialized = JSON.stringify({ elements, appState });

        // Skip if no actual changes
        if (serialized === lastSaveRef.current) return;

        lastSaveRef.current = serialized;

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Trigger content change callback (for marking dirty)
        const cleanup = onContentChange?.({ elements, appState });

        // Auto-save after 2 seconds of inactivity
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await onSave?.({ elements, appState });
                cleanup?.(); // Clean up the auto-save timeout
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }, 2000);
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

    return (
        <div
            className="h-full w-full"
            onClick={handleClick}
        >
            <CanvasProvider projectId={projectId} canvasId={fileId}>
                <EnhancedExcalidrawCanvas
                    projectId={projectId}
                    canvasId={fileId}
                    projectName={fileData.title}
                    isReadOnly={isReadOnly}
                />
            </CanvasProvider>
        </div>
    );
}