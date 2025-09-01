"use client";

import React, { useEffect, memo, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjectFiles } from '@/lib/hooks/useProjectData';
import { useWorkspaceStore, useActiveFileId, useOpenFiles, useFullscreenMode } from '@/lib/stores/useWorkspaceStore';
import { WorkspaceEditor } from './WorkspaceEditor';
import { WorkspaceBottomBar } from './WorkspaceBottomBar';
import { Button } from '@/components/ui/button';
import {
    FileText,
    PencilRuler,
    FolderOpen,
    Minimize,
    X
} from 'lucide-react';

interface UnifiedWorkspaceProps {
    projectId: string;
    project: any;
    currentUser: any;
    isReadOnly?: boolean;
    isPublicView?: boolean;
}

// Memoized empty state component
const EmptyState = memo(function EmptyState({
    project,
    isReadOnly,
    onCreateFile,
}: {
    project: any;
    isReadOnly: boolean;
    onCreateFile: (type: 'document' | 'canvas') => void;
}) {
    return (
        <div className="h-full flex flex-col">
            <div className="border-b bg-card">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
                            {project.description && (
                                <p className="text-muted-foreground">{project.description}</p>
                            )}
                        </div>

                        {!isReadOnly && (
                            <div className="flex gap-2">
                                <Button onClick={() => onCreateFile('document')} className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    New Document
                                </Button>
                                <Button onClick={() => onCreateFile('canvas')} variant="outline" className="gap-2">
                                    <PencilRuler className="w-4 h-4" />
                                    New Canvas
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted/50 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <FolderOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No files yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                        {isReadOnly
                            ? "This project doesn't have any files yet."
                            : "Get started by creating your first document or canvas."
                        }
                    </p>

                    {!isReadOnly && (
                        <div className="flex gap-3 justify-center">
                            <Button onClick={() => onCreateFile('document')} className="gap-2">
                                <FileText className="w-4 h-4" />
                                Create Document
                            </Button>
                            <Button onClick={() => onCreateFile('canvas')} variant="outline" className="gap-2">
                                <PencilRuler className="w-4 h-4" />
                                Create Canvas
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

// Memoized loading state component
const LoadingState = memo(function LoadingState() {
    return (
        <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                    <FolderOpen className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div>
                    <h3 className="font-semibold">Loading Project</h3>
                    <p className="text-sm text-muted-foreground">Fetching your files...</p>
                </div>
            </div>
        </div>
    );
});

// Memoized fullscreen controls
const FullscreenControls = memo(function FullscreenControls({
    onToggleFullscreen,
}: {
    onToggleFullscreen: () => void;
}) {
    return (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button
                size="sm"
                variant="secondary"
                onClick={onToggleFullscreen}
                className="gap-2 shadow-lg z-[99]"
                title="Exit fullscreen (Esc or F11)"
            >
                <Minimize className="w-4 h-4" />
            </Button>
        </div>
    );
});

export const UnifiedWorkspace = memo(function UnifiedWorkspace({
    projectId,
    project,
    currentUser,
    isReadOnly = false,
    isPublicView = false,
}: UnifiedWorkspaceProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { files, isLoading, mutateAll } = useProjectFiles(projectId);
    
    // Use optimized selectors to prevent re-renders
    const openFiles = useOpenFiles();
    const activeFileId = useActiveFileId();
    const fullscreenMode = useFullscreenMode();
    
    const {
        openFile,
        setActiveFile,
        initializeWorkspace,
        toggleFullscreen
    } = useWorkspaceStore();

    // Initialize workspace
    useEffect(() => {
        initializeWorkspace(projectId);
    }, [projectId, initializeWorkspace]);

    // Keyboard shortcuts for fullscreen
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'F11' ||
                ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F')) {
                event.preventDefault();
                toggleFullscreen();
            }
            if (event.key === 'Escape' && fullscreenMode) {
                event.preventDefault();
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleFullscreen, fullscreenMode]);

    // Handle URL file parameter and auto-open files (memoized to prevent re-runs)
    const handleUrlFileParam = useCallback(() => {
        if (!isLoading && files.length > 0) {
            const fileParam = searchParams.get('file');

            if (fileParam) {
                const fileFromUrl = files.find(f => f.id === fileParam);
                if (fileFromUrl && !openFiles[fileParam]) {
                    openFile(fileFromUrl.id, fileFromUrl.type, fileFromUrl.title);
                    setActiveFile(fileFromUrl.id);
                }
            } else if (Object.keys(openFiles).length === 0) {
                // Auto-open most recent file if no files are open and no URL param
                const mostRecentFile = files[0];
                if (mostRecentFile) {
                    openFile(mostRecentFile.id, mostRecentFile.type, mostRecentFile.title);
                    setActiveFile(mostRecentFile.id);
                    
                    // Update URL
                    const params = new URLSearchParams(searchParams);
                    params.set('file', mostRecentFile.id);
                    router.replace(`?${params.toString()}`, { scroll: false });
                }
            }
        }
    }, [isLoading, files, openFiles, searchParams, openFile, setActiveFile, router]);

    useEffect(() => {
        handleUrlFileParam();
    }, [handleUrlFileParam]);

    const handleFileClick = useCallback((file: any) => {
        openFile(file.id, file.type, file.title);
        setActiveFile(file.id);

        // Update URL parameter without reloading
        const params = new URLSearchParams(searchParams);
        params.set('file', file.id);
        router.replace(`?${params.toString()}`, { scroll: false });
    }, [openFile, setActiveFile, searchParams, router]);

    const handleCreateFile = useCallback(async (type: 'document' | 'canvas') => {
        if (isReadOnly) return;

        try {
            const endpoint = type === 'document'
                ? `/api/projects/${projectId}/documents`
                : `/api/projects/${projectId}/canvases`;

            const payload = type === 'document'
                ? {
                    title: 'Untitled Document',
                    content: {
                        type: 'doc',
                        content: [
                            {
                                type: 'heading',
                                attrs: { level: 1 },
                                content: [{ type: 'text', text: 'Welcome to your new document!' }]
                            },
                            {
                                type: 'paragraph',
                                content: [
                                    { type: 'text', text: 'Start writing here...' }
                                ]
                            }
                        ]
                    },
                }
                : {
                    title: 'Untitled Canvas',
                    elements: [],
                    appState: {},
                };

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const newFile = await response.json();
                mutateAll(); // Refresh file list
                handleFileClick({ ...newFile, type } as any);
            }
        } catch (error) {
            console.error(`Failed to create ${type}:`, error);
        }
    }, [isReadOnly, projectId, mutateAll, handleFileClick]);

    // Memoize the active file data to prevent re-renders
    const activeFile = useMemo(() => {
        return activeFileId && openFiles[activeFileId] ? openFiles[activeFileId] : null;
    }, [activeFileId, openFiles]);

    // Show loading state
    if (isLoading) {
        return <LoadingState />;
    }

    // Show empty state if no files
    if (files.length === 0) {
        return (
            <EmptyState
                project={project}
                isReadOnly={isReadOnly}
                onCreateFile={handleCreateFile}
            />
        );
    }

    // Show workspace with files - keep all editors mounted
    return (
        <div className="h-full flex flex-col relative">
            {/* Fullscreen Exit Button - Only visible in fullscreen mode */}
            {fullscreenMode && (
                <FullscreenControls onToggleFullscreen={toggleFullscreen} />
            )}

            {/* Editor Container - This is where the magic happens */}
            <div className="flex-1 overflow-hidden">
                {Object.keys(openFiles).length > 0 ? (
                    // Use the persistent WorkspaceEditor that keeps all editors mounted
                    <WorkspaceEditor
                        fileId={activeFileId || Object.keys(openFiles)[0]}
                        fileType={activeFile?.type || 'document'}
                        projectId={projectId}
                        isReadOnly={isReadOnly}
                        isActive={true}
                        onActivate={() => {}}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center bg-muted/20">
                        <div className="text-center space-y-4">
                            <div className="text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-2" />
                                <p>Select a file to start editing</p>
                            </div>
                            {fullscreenMode && (
                                <div className="mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={toggleFullscreen}
                                        className="gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Exit Fullscreen
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar - Hide in fullscreen mode */}
            {!fullscreenMode && (
                <WorkspaceBottomBar
                    projectId={projectId}
                    project={project}
                    isReadOnly={isReadOnly}
                />
            )}
        </div>
    );
});