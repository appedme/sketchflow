'use client';

import { useEffect, useRef, useCallback } from 'react';
import { markFileDirty, notifyFileSaved, updateFileCache } from '@/lib/fileCache';

interface UseCanvasSyncOptions {
    filePath: string;
    onContentChange?: (content: string) => void;
    debounceMs?: number;
}

/**
 * Hook to sync canvas changes with the file cache system
 * 
 * @param options Configuration options
 * @returns Functions to interact with the canvas sync system
 */
export function useCanvasSync({
    filePath,
    onContentChange,
    debounceMs = 500
}: UseCanvasSyncOptions) {
    const lastSavedContent = useRef<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Track when the canvas is modified
    const handleCanvasChange = useCallback((content: string) => {
        // Clear any existing debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Mark the file as dirty immediately
        markFileDirty(filePath);

        // Debounce the actual save operation
        debounceTimer.current = setTimeout(() => {
            // Save the content to cache
            updateFileCache(filePath, content);
            lastSavedContent.current = content;

            // Notify listeners if needed
            if (onContentChange) {
                onContentChange(content);
            }
        }, debounceMs);
    }, [filePath, onContentChange, debounceMs]);

    // Save the canvas content
    const saveCanvas = useCallback((content: string) => {
        // Clear any existing debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }

        // Save the content and notify that it's been saved
        notifyFileSaved(filePath, content);
        lastSavedContent.current = content;

        // Notify listeners if needed
        if (onContentChange) {
            onContentChange(content);
        }
    }, [filePath, onContentChange]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    // Listen for file selection events
    useEffect(() => {
        const handleFileSelected = (event: CustomEvent) => {
            const { path } = event.detail;

            // If another file is selected and we have unsaved changes, save them
            if (path !== filePath && lastSavedContent.current !== null) {
                saveCanvas(lastSavedContent.current);
            }
        };

        window.addEventListener('file:selected' as any, handleFileSelected as EventListener);

        return () => {
            window.removeEventListener('file:selected' as any, handleFileSelected as EventListener);
        };
    }, [filePath, saveCanvas]);

    return {
        handleCanvasChange,
        saveCanvas
    };
}