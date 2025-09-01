'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFileContent } from '@/lib/fileCache';
import { useCanvasSync } from '@/hooks/workspace/useCanvasSync';
import { toast } from 'sonner';
import { useFileOperations } from '@/components/files/FileStatusIndicator';
import { useLoading } from '@/components/ui/loading-bar';

interface CanvasWrapperProps {
    filePath: string;
    fetchContent: () => Promise<string>;
    autoSave?: boolean;
    autoSaveInterval?: number;
    children: (props: {
        content: string | null;
        isLoading: boolean;
        onChange: (content: string) => void;
        onSave: () => void;
        isDirty: boolean;
    }) => React.ReactNode;
}

/**
 * Wrapper component for canvas editors to handle file content loading and saving
 */
export function CanvasWrapper({
    filePath,
    fetchContent,
    autoSave = true,
    autoSaveInterval = 5000,
    children
}: CanvasWrapperProps) {
    const { content, isLoading, revalidate, updateContent } = useFileContent(filePath, fetchContent);
    const [currentContent, setCurrentContent] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const hasInitialized = useRef(false);
    const lastSavedContent = useRef<string | null>(null);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const { startOperation, completeOperation } = useFileOperations();
    const { startLoading, completeLoading } = useLoading();
    const operationIdRef = useRef(`save-${filePath}-${Date.now()}`);

    // Initialize current content when loaded
    useEffect(() => {
        if (content !== null && !hasInitialized.current) {
            setCurrentContent(content);
            lastSavedContent.current = content;
            hasInitialized.current = true;
        }
    }, [content]);

    // Set up canvas sync
    const { handleCanvasChange, saveCanvas } = useCanvasSync({
        filePath,
        onContentChange: (newContent) => {
            // This is called when content is auto-saved to cache
            setCurrentContent(newContent);
            lastSavedContent.current = newContent;
            setIsDirty(false);
        }
    });

    // Handle content changes
    const handleContentChange = (newContent: string) => {
        setCurrentContent(newContent);
        setIsDirty(newContent !== lastSavedContent.current);
        handleCanvasChange(newContent);

        // Reset auto-save timer
        if (autoSave && autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
            autoSaveTimerRef.current = setTimeout(() => {
                if (newContent !== lastSavedContent.current) {
                    handleAutoSave(newContent);
                }
            }, autoSaveInterval);
        }
    };

    // Auto-save handler
    const handleAutoSave = (contentToSave: string) => {
        const opId = `autosave-${filePath}-${Date.now()}`;
        operationIdRef.current = opId;

        startOperation(opId, 'saving', filePath, 'Auto-saving...');

        // Save the content
        saveCanvas(contentToSave);
        lastSavedContent.current = contentToSave;
        setIsDirty(false);

        // Update operation status
        setTimeout(() => {
            completeOperation(opId, true, 'Auto-saved');
        }, 500);
    };

    // Handle manual save
    const handleSave = () => {
        if (currentContent !== null) {
            const opId = `save-${filePath}-${Date.now()}`;
            operationIdRef.current = opId;

            startOperation(opId, 'saving', filePath, 'Saving...');
            startLoading('Saving document...', 'default');

            // Save the content
            saveCanvas(currentContent);
            lastSavedContent.current = currentContent;
            setIsDirty(false);

            // Update operation status
            setTimeout(() => {
                completeOperation(opId, true, 'Saved successfully');
                completeLoading(true, 'Document saved');
                toast.success('Document saved successfully');
            }, 800);
        }
    };

    // Set up auto-save
    useEffect(() => {
        if (autoSave) {
            autoSaveTimerRef.current = setTimeout(() => {
                if (currentContent !== null && currentContent !== lastSavedContent.current) {
                    handleAutoSave(currentContent);
                }
            }, autoSaveInterval);
        }

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [autoSave, autoSaveInterval, currentContent]);

    // Force revalidation when switching back to this component
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                revalidate();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [revalidate]);

    // Listen for file selection events to ensure we're showing the latest content
    useEffect(() => {
        const handleFileSelected = (event: CustomEvent) => {
            const { path } = event.detail;

            if (path === filePath) {
                // Force revalidation when this file is selected
                startLoading(`Loading ${path.split('/').pop()}...`);
                revalidate();
                setTimeout(() => {
                    completeLoading(true);
                }, 500);
            }
        };

        window.addEventListener('file:selected' as any, handleFileSelected as EventListener);

        return () => {
            window.removeEventListener('file:selected' as any, handleFileSelected as EventListener);
        };
    }, [filePath, revalidate, startLoading, completeLoading]);

    // Save content when navigating away
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                // Auto-save before unloading
                if (currentContent !== null && currentContent !== lastSavedContent.current) {
                    saveCanvas(currentContent);
                }

                // Show confirmation dialog
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // Save when unmounting if dirty
            if (isDirty && currentContent !== null && currentContent !== lastSavedContent.current) {
                saveCanvas(currentContent);

                // Show notification
                toast.success('Changes saved automatically');
            }
        };
    }, [isDirty, currentContent, saveCanvas]);

    return (
        <>
            {children({
                content: currentContent,
                isLoading,
                onChange: handleContentChange,
                onSave: handleSave,
                isDirty
            })}
        </>
    );
}