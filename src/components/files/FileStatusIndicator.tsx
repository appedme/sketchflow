'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Check, X, Save, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FileOperationType = 'saving' | 'revalidating' | 'renaming' | 'deleting' | 'creating' | 'uploading' | 'downloading';
export type FileOperationStatus = 'idle' | 'loading' | 'success' | 'error';

interface FileStatusIndicatorProps {
    type: FileOperationType;
    status: FileOperationStatus;
    message?: string;
    className?: string;
    onComplete?: () => void;
}

const operationIcons = {
    saving: Save,
    revalidating: RefreshCw,
    renaming: Save,
    deleting: X,
    creating: Save,
    uploading: Save,
    downloading: Save,
};

const statusClasses = {
    idle: 'text-muted-foreground',
    loading: 'text-primary animate-pulse',
    success: 'text-green-500',
    error: 'text-red-500',
};

export function FileStatusIndicator({
    type,
    status,
    message,
    className,
    onComplete
}: FileStatusIndicatorProps) {
    const [visible, setVisible] = useState(status !== 'idle');
    const [displayStatus, setDisplayStatus] = useState(status);

    // Handle status changes
    useEffect(() => {
        if (status === 'idle') {
            // If transitioning to idle, delay hiding to allow animation
            if (displayStatus !== 'idle') {
                const timer = setTimeout(() => {
                    setVisible(false);
                    setDisplayStatus('idle');
                    onComplete?.();
                }, 2000);
                return () => clearTimeout(timer);
            }
        } else {
            // For other statuses, show immediately
            setVisible(true);
            setDisplayStatus(status);

            // Auto-hide success/error after a delay
            if (status === 'success' || status === 'error') {
                const timer = setTimeout(() => {
                    setVisible(false);
                    setDisplayStatus('idle');
                    onComplete?.();
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [status, displayStatus, onComplete]);

    if (!visible) return null;

    const Icon = operationIcons[type];

    return (
        <div
            className={cn(
                'flex items-center gap-2 px-3 py-1 text-sm rounded-md transition-all',
                statusClasses[displayStatus],
                className,
                visible ? 'opacity-100' : 'opacity-0'
            )}
        >
            {displayStatus === 'loading' ? (
                <Loader2 className="h-3 w-3 animate-spin" />
            ) : displayStatus === 'success' ? (
                <Check className="h-3 w-3" />
            ) : displayStatus === 'error' ? (
                <X className="h-3 w-3" />
            ) : (
                <Icon className="h-3 w-3" />
            )}
            <span>{message || getDefaultMessage(type, displayStatus)}</span>
        </div>
    );
}

// Global file operation status manager
type FileOperationState = {
    operations: Record<string, {
        type: FileOperationType;
        status: FileOperationStatus;
        message?: string;
        filePath?: string;
    }>;
};

type FileOperationActions = {
    startOperation: (id: string, type: FileOperationType, filePath?: string, message?: string) => void;
    completeOperation: (id: string, success?: boolean, message?: string) => void;
    clearOperation: (id: string) => void;
};

const FileOperationContext = React.createContext<FileOperationState & FileOperationActions>({
    operations: {},
    startOperation: () => { },
    completeOperation: () => { },
    clearOperation: () => { },
});

export function FileOperationProvider({ children }: { children: React.ReactNode }) {
    const [operations, setOperations] = useState<FileOperationState['operations']>({});

    const startOperation = React.useCallback((
        id: string,
        type: FileOperationType,
        filePath?: string,
        message?: string
    ) => {
        setOperations(prev => ({
            ...prev,
            [id]: { type, status: 'loading', message, filePath }
        }));
    }, []);

    const completeOperation = React.useCallback((
        id: string,
        success = true,
        message?: string
    ) => {
        setOperations(prev => {
            if (!prev[id]) return prev;

            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    status: success ? 'success' : 'error',
                    message: message || prev[id].message
                }
            };
        });

        // Auto-clear after a delay
        setTimeout(() => {
            clearOperation(id);
        }, 3000);
    }, []);

    const clearOperation = React.useCallback((id: string) => {
        setOperations(prev => {
            const newOps = { ...prev };
            delete newOps[id];
            return newOps;
        });
    }, []);

    return (
        <FileOperationContext.Provider
            value={{
                operations,
                startOperation,
                completeOperation,
                clearOperation,
            }}
        >
            {children}
        </FileOperationContext.Provider>
    );
}

export function useFileOperations() {
    return React.useContext(FileOperationContext);
}

// Helper function to get default messages
function getDefaultMessage(type: FileOperationType, status: FileOperationStatus): string {
    if (status === 'loading') {
        switch (type) {
            case 'saving': return 'Saving...';
            case 'revalidating': return 'Revalidating...';
            case 'renaming': return 'Renaming...';
            case 'deleting': return 'Deleting...';
            case 'creating': return 'Creating...';
            case 'uploading': return 'Uploading...';
            case 'downloading': return 'Downloading...';
        }
    } else if (status === 'success') {
        switch (type) {
            case 'saving': return 'Saved successfully';
            case 'revalidating': return 'Revalidated successfully';
            case 'renaming': return 'Renamed successfully';
            case 'deleting': return 'Deleted successfully';
            case 'creating': return 'Created successfully';
            case 'uploading': return 'Uploaded successfully';
            case 'downloading': return 'Downloaded successfully';
        }
    } else if (status === 'error') {
        switch (type) {
            case 'saving': return 'Failed to save';
            case 'revalidating': return 'Failed to revalidate';
            case 'renaming': return 'Failed to rename';
            case 'deleting': return 'Failed to delete';
            case 'creating': return 'Failed to create';
            case 'uploading': return 'Failed to upload';
            case 'downloading': return 'Failed to download';
        }
    }

    return '';
}