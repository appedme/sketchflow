"use client";

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjectFiles } from '@/lib/hooks/useProjectData';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { WorkspaceEditor } from './WorkspaceEditor';

import { WorkspaceBottomBar } from './WorkspaceBottomBar';
import { Button } from '@/components/ui/button';
import {
    FileText,
    PencilRuler,
    Plus,
    FolderOpen,
    Clock,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnifiedWorkspaceProps {
    projectId: string;
    project: any;
    currentUser: any;
    isReadOnly?: boolean;
    isPublicView?: boolean;
}

export function UnifiedWorkspace({
    projectId,
    project,
    currentUser,
    isReadOnly = false,
    isPublicView = false,
}: UnifiedWorkspaceProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { files, isLoading, mutateAll } = useProjectFiles(projectId);
    const {
        openFiles,
        activeFileId,
        openFile,
        setActiveFile,
        initializeWorkspace
    } = useWorkspaceStore();

    // Initialize workspace
    useEffect(() => {
        initializeWorkspace(projectId);
    }, [projectId, initializeWorkspace]);

    // Handle URL file parameter and auto-open files
    useEffect(() => {
        if (!isLoading && files.length > 0) {
            const fileParam = searchParams.get('file');

            if (fileParam) {
                // Open file from URL parameter
                const fileFromUrl = files.find(f => f.id === fileParam);
                if (fileFromUrl && !openFiles[fileParam]) {
                    openFile(fileFromUrl.id, fileFromUrl.type, fileFromUrl.title);
                    setActiveFile(fileFromUrl.id);
                }
            } else if (Object.keys(openFiles).length === 0) {
                // Auto-open most recent file if no files are open and no URL param
                const mostRecentFile = files[0]; // Already sorted by updatedAt
                handleFileClick(mostRecentFile);
            }
        }
    }, [isLoading, files, openFiles, searchParams]);

    const handleFileClick = (file: any) => {
        openFile(file.id, file.type, file.title);
        setActiveFile(file.id);

        // Update URL parameter without reloading
        const params = new URLSearchParams(searchParams);
        params.set('file', file.id);
        router.replace(`?${params.toString()}`, { scroll: false });
    };

    const handleCreateFile = async (type: 'document' | 'canvas') => {
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
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    // Show loading state
    if (isLoading) {
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
    }

    // Show empty state if no files
    if (files.length === 0) {
        return (
            <div className="h-full flex flex-col">
                {/* Header */}
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
                                    <Button onClick={() => handleCreateFile('document')} className="gap-2">
                                        <FileText className="w-4 h-4" />
                                        New Document
                                    </Button>
                                    <Button onClick={() => handleCreateFile('canvas')} variant="outline" className="gap-2">
                                        <PencilRuler className="w-4 h-4" />
                                        New Canvas
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Empty state */}
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
                                <Button onClick={() => handleCreateFile('document')} className="gap-2">
                                    <FileText className="w-4 h-4" />
                                    Create Document
                                </Button>
                                <Button onClick={() => handleCreateFile('canvas')} variant="outline" className="gap-2">
                                    <PencilRuler className="w-4 h-4" />
                                    Create Canvas
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Show workspace with files - no sidebar since layout handles it
    return (
        <div className="h-full flex flex-col">


            {/* Editor */}
            <div className="flex-1 overflow-hidden">
                {activeFileId && openFiles[activeFileId] ? (
                    <WorkspaceEditor
                        key={activeFileId} // This ensures each file gets its own editor instance
                        fileId={activeFileId}
                        fileType={openFiles[activeFileId].type}
                        projectId={projectId}
                        isReadOnly={isReadOnly}
                        isActive={true}
                        onActivate={() => { }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center bg-muted/20">
                        <div className="text-center space-y-4">
                            <div className="text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-2" />
                                <p>Select a file to start editing</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Bar */}
            <WorkspaceBottomBar
                projectId={projectId}
                project={project}
                isReadOnly={isReadOnly}
            />
        </div>
    );
}