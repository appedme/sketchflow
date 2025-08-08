"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectFiles } from '@/lib/hooks/useProjectData';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
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

interface WorkspaceProjectLandingProps {
    projectId: string;
    project: any;
    currentUser: any;
    isReadOnly?: boolean;
    isPublicView?: boolean;
}

export function WorkspaceProjectLanding({
    projectId,
    project,
    currentUser,
    isReadOnly = false,
    isPublicView = false,
}: WorkspaceProjectLandingProps) {
    const router = useRouter();
    const { files, isLoading, mutateAll } = useProjectFiles(projectId);
    const { openFile, initializeWorkspace } = useWorkspaceStore();

    // Initialize workspace
    useEffect(() => {
        initializeWorkspace(projectId);
    }, [projectId, initializeWorkspace]);

    // Auto-redirect to most recent file if files exist
    useEffect(() => {
        if (!isLoading && files.length > 0) {
            const mostRecentFile = files[0]; // Already sorted by updatedAt
            handleFileClick(mostRecentFile);
        }
    }, [isLoading, files]);

    const handleFileClick = (file: any) => {
        openFile(file.id, file.type, file.title);
        router.push(`/workspace/${projectId}/${file.id}`);
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

    return (
        <div className="h-full flex flex-col bg-background">
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

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {files.length === 0 ? (
                        // Empty state
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
                    ) : (
                        // File list
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold">Recent Files</h2>
                                <span className="text-sm text-muted-foreground">
                                    {files.length} file{files.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            <div className="grid gap-3">
                                {files.slice(0, 10).map((file) => {
                                    const Icon = file.type === 'canvas' ? PencilRuler : FileText;

                                    return (
                                        <div
                                            key={file.id}
                                            className={cn(
                                                "group flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                                                "hover:bg-muted/50 hover:border-primary/20"
                                            )}
                                            onClick={() => handleFileClick(file)}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                                file.type === 'canvas' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                                            )}>
                                                <Icon className="w-5 h-5" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                                                    {file.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    <span>Updated {formatDate(file.updatedAt)}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{file.type}</span>
                                                </div>
                                            </div>

                                            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    );
                                })}
                            </div>

                            {files.length > 10 && (
                                <div className="text-center mt-6">
                                    <p className="text-sm text-muted-foreground">
                                        And {files.length - 10} more files...
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}