'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useFileContent } from '@/lib/fileCache';
import { useCanvasSync } from '@/hooks/useCanvasSync';
import { toast } from 'sonner';

interface CanvasWrapperProps {
    filePath: string;
    fetchContent: () => Promise<string>;
    children: (props: {
        content: string | null;
        isLoading: boolean;
        onChange: (content: string) => void;
        onSave: () => void;
    }) => React.ReactNode;
}

/**
 * Wrapper component for canvas editors to handle file content loading and saving
 */
export function CanvasWrapper({
    filePath,
    fetchContent,
    children
}: CanvasWrapperProps) {
    const { content, isLoading, revalidate, updateContent } = useFileContent(filePath, fetchContent);
    const [currentContent, setCurrentContent] = useState<string | null>(null);
    const hasInitialized = useRef(false);

    // Initialize current content when loaded
    useEffect(() => {
        if (content !== null && !hasInitialized.current) {
            setCurrentContent(content);
            hasInitialized.current = true;
        }
    }, [content]);

    // Set up canvas sync
    const { handleCanvasChange, saveCanvas } = useCanvasSync({
        filePath,
        onContentChange: (newContent) => {
            // This is called when content is auto-saved to cache
            setCurrentContent(newContent);
        }
    });

    // Handle content changes
    const handleContentChange = (newContent: string) => {
        setCurrentContent(newContent);
        handleCanvasChange(newContent);
    };

    // Handle manual save
    const handleSave = () => {
        if (currentContent !== null) {
            saveCanvas(currentContent);
            toast.success('Changes saved successfully');
        }
    };

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
                revalidate();
            }
        };

        window.addEventListener('file:selected' as any, handleFileSelected as EventListener);

        return () => {
            window.removeEventListener('file:selected' as any, handleFileSelected as EventListener);
        };
    }, [filePath, revalidate]);

    return (
        <>
            {children({
                content: currentContent,
                isLoading,
                onChange: handleContentChange,
                onSave: handleSave
            })}
        </>
    );
}