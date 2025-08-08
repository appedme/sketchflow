"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectFiles } from '@/lib/hooks/useProjectData';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileText,
    PencilRuler,
    Search,
    Plus,
    MoreHorizontal,
    Clock,
    Folder
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkspaceSidebarProps {
    projectId: string;
    project: any;
}

export function WorkspaceSidebar({ projectId, project }: WorkspaceSidebarProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const { files, isLoading, mutateAll } = useProjectFiles(projectId);
    const { openFile, activeFileId } = useWorkspaceStore();

    // Filter files by search term
    const filteredFiles = files.filter(file =>
        file.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group files by type
    const documents = filteredFiles.filter(f => f.type === 'document');
    const canvases = filteredFiles.filter(f => f.type === 'canvas');

    const handleFileClick = (file: any) => {
        openFile(file.id, file.type, file.title);
        router.push(`/workspace/${projectId}/${file.id}`, { scroll: false });
    };

    const handleCreateFile = async (type: 'document' | 'canvas') => {
        try {
            const endpoint = type === 'document'
                ? `/api/projects/${projectId}/documents`
                : `/api/projects/${projectId}/canvases`;

            const payload = type === 'document'
                ? {
                    title: 'Untitled Document',
                    content: { type: 'doc', content: [] },
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

    const FileItem = ({ file }: { file: any }) => {
        const Icon = file.type === 'canvas' ? PencilRuler : FileText;
        const isActive = activeFileId === file.id;

        return (
            <div
                className={cn(
                    "group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    "hover:bg-muted/50",
                    isActive && "bg-primary/10 border border-primary/20"
                )}
                onClick={() => handleFileClick(file)}
            >
                <Icon className={cn(
                    "w-4 h-4 flex-shrink-0",
                    file.type === 'canvas' ? "text-purple-500" : "text-blue-500",
                    isActive && "text-primary"
                )} />

                <div className="flex-1 min-w-0">
                    <p className={cn(
                        "text-sm font-medium truncate",
                        isActive && "text-primary"
                    )}>
                        {file.title}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDate(file.updatedAt)}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                        >
                            <MoreHorizontal className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFileClick(file)}>
                            Open
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-card">
            {/* Header */}
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Folder className="w-4 h-4 text-primary" />
                        <h2 className="font-semibold truncate">{project.name}</h2>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCreateFile('document')}>
                                <FileText className="w-4 h-4 mr-2" />
                                New Document
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateFile('canvas')}>
                                <PencilRuler className="w-4 h-4 mr-2" />
                                New Canvas
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-8"
                    />
                </div>
            </div>

            {/* File List */}
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2">
                                    <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-4 bg-muted rounded animate-pulse" />
                                        <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Documents */}
                            {documents.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Documents ({documents.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {documents.map((file) => (
                                            <FileItem key={file.id} file={file} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Canvases */}
                            {canvases.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                        Canvases ({canvases.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {canvases.map((file) => (
                                            <FileItem key={file.id} file={file} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty state */}
                            {filteredFiles.length === 0 && !isLoading && (
                                <div className="text-center py-8">
                                    <Folder className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {searchTerm ? 'No files found' : 'No files yet'}
                                    </p>
                                    {!searchTerm && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCreateFile('document')}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create First File
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}