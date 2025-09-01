"use client";

import React, { useEffect, useCallback } from 'react';
import { PlateDocumentEditor } from '@/components/project/PlateDocumentEditor';

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
    // Handle activation
    const handleClick = useCallback(() => {
        if (!isActive) {
            onActivate?.();
        }
    }, [isActive, onActivate]);

    // Handle workspace save events - forward to PlateDocumentEditor
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
            <PlateDocumentEditor
                documentId={fileId}
                projectId={projectId}
                projectName={fileData?.title || 'Untitled Document'}
                isReadOnly={isReadOnly}
                className="h-full"
                onContentChange={onContentChange}
                onSave={onSave}
            />
        </div>
    );
}