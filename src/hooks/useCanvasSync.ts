'use client';

import { useEffect, useRef, useCallback } from 'react';
import { markFileDirty, notifyFileSaved, updateFileCache } from '@/lib/fileCache';
import { useFileOperations } from '@/components/files/FileStatusIndicator';

interface UseCanvasSyncOptions {
    filePath: string;
    onContentChange?: (content: string) => void;
    debounceMs?: number;
    autoSave?: boolean;
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
    debounceMs = 500,
    autoSave = true
}: UseCanvasSyncOptions) {
    const lastSavedContent = useRef<string | null>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const contentRef = useRef<string | null>(null);
    const { startOperation, completeOperation } = useFileOperations();
    const operationIdRef = useRef<string | null>(null);

    // Track when the canvas is modified
    const handleCanvasChange = useCallback((content: string) => {
        // Store the latest content
        contentRef.current = content;

        // Mark the file as dirty immediately
        markFileDirty(filePath);

        // Clear any existing debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        if (autoSave) {
            // Debounce the actual save operation
            debounceTimer.current = setTimeout(() => {
                // Create a unique operation ID
                const opId = `autosave-${filePath}-${Date.now()}`;
                operationIdRef.current = opId;

                // Start the operation
                startOperation(opId, 'saving', filePath, 'Auto-saving...');

                // Save the content to cache
                updateFileCache(filePath, content);
                lastSavedContent.current = content;

                // Notify listeners if needed
                if (onContentChange) {
                    onContentChange(content);
                }

                // Complete the operation
                setTimeout(() => {
                    completeOperation(opId, true, 'Auto-saved');
                }, 500);
            }, debounceMs);
        }
    }, [filePath, onContentChange, debounceMs, autoSave, startOperation, completeOperation]);

    // Save the canvas content
    const saveCanvas = useCallback((content: string) => {
        // Clear any existing debounce timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }

        // Create a unique operation ID
        const opId = `save-${filePath}-${Date.now()}`;
        operationIdRef.current = opId;

        // Start the operation
        startOperation(opId, 'saving', filePath, 'Saving...');

        // Save the content and notify that it's been saved
        notifyFileSaved(filePath, content);
        lastSavedContent.current = content;
        contentRef.current = content;

        // Notify listeners if needed
        if (onContentChange) {
            onContentChange(content);
        }

        // Complete the operation
        setTimeout(() => {
            completeOperation(opId, true, 'Saved successfully');
        }, 800);
    }, [filePath, onContentChange, startOperation, completeOperation]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            // Auto-save on unmount if there are unsaved changes
            if (contentRef.current !== null && contentRef.current !== lastSavedContent.current) {
                notifyFileSaved(filePath, contentRef.current);
            }
        };
    }, [filePath]);

    // Listen for file selection events
    useEffect(() => {
        const handleFileSelected = (event: CustomEvent) => {
            const { path } = event.detail;

            // If another file is selected and we have unsaved changes, save them
            if (path !== filePath && contentRef.current !== null && contentRef.current !== lastSavedContent.current) {
                // Create a unique operation ID
                const opId = `autosave-${filePath}-${Date.now()}`;
                operationIdRef.current = opId;

                // Start the operation
                startOperation(opId, 'saving', filePath, 'Auto-saving before switching...');

                // Save the content
                notifyFileSaved(filePath, contentRef.current);
                lastSavedContent.current = contentRef.current;

                // Complete the operation
                setTimeout(() => {
                    completeOperation(opId, true, 'Auto-saved');
                }, 500);
            }
        };

        window.addEventListener('file:selected' as any, handleFileSelected as EventListener);

        return () => {
            window.removeEventListener('file:selected' as any, handleFileSelected as EventListener);
        };
    }, [filePath, startOperation, completeOperation]);

    return {
        handleCanvasChange,
        saveCanvas,
        currentContent: contentRef.current,
        lastSavedContent: lastSavedContent.current,
        isDirty: contentRef.current !== lastSavedContent.current
    };
}