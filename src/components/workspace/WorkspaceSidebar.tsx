"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProjectFiles } from '@/lib/hooks/useProjectData';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileText,
    PencilRuler,
    Search,
    Plus,
    MoreHorizontal,
    Clock,
    Folder,
    Edit2,
    Check,
    X,
    Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { mutate } from 'swr';

interface WorkspaceSidebarProps {
    projectId: string;
    project: any;
}

export function WorkspaceSidebar({ projectId, project }: WorkspaceSidebarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Project editing states
    const [editingProject, setEditingProject] = useState(false);
    const [projectName, setProjectName] = useState(project?.name || '');
    const [projectDescription, setProjectDescription] = useState(project?.description || '');

    const router = useRouter();
    const searchParams = useSearchParams();
    const { files, isLoading, mutateAll } = useProjectFiles(projectId);
    const { openFile, activeFileId, setActiveFile } = useWorkspaceStore();

    // Filter files by search term
    const filteredFiles = files.filter(file =>
        file.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group files by type
    const documents = filteredFiles.filter(f => f.type === 'document');
    const canvases = filteredFiles.filter(f => f.type === 'canvas');

    const handleFileClick = (file: any) => {
        openFile(file.id, file.type, file.title);
        setActiveFile(file.id);
        
        // Update URL parameter without reloading
        const params = new URLSearchParams(searchParams);
        params.set('file', file.id);
        router.replace(`?${params.toString()}`, { scroll: false });
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

    const startRename = (file: any) => {
        setEditingId(file.id);
        setEditingTitle(file.title);
    };

    const saveRename = async (file: any) => {
        if (!editingTitle.trim()) return;

        const newTitle = editingTitle.trim();
        const oldTitle = file.title;

        // Clear editing state immediately
        setEditingId(null);
        setEditingTitle('');

        try {
            // Optimistic update - update the files list immediately
            const updatedFiles = files.map(f =>
                f.id === file.id ? { ...f, title: newTitle } : f
            );

            // Update cache optimistically
            mutate(`/api/projects/${projectId}/documents`,
                files.filter(f => f.type === 'document').map(f =>
                    f.id === file.id ? { ...f, title: newTitle } : f
                ), false);
            mutate(`/api/projects/${projectId}/canvases`,
                files.filter(f => f.type === 'canvas').map(f =>
                    f.id === file.id ? { ...f, title: newTitle } : f
                ), false);

            const endpoint = file.type === 'document'
                ? `/api/documents/${file.id}`
                : `/api/canvas/${file.id}`;

            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle }),
            });

            if (!response.ok) throw new Error('Failed to rename');

            // Revalidate to get fresh data
            mutateAll();
        } catch (error) {
            console.error('Failed to rename:', error);
            // Revert optimistic update
            mutate(`/api/projects/${projectId}/documents`,
                files.filter(f => f.type === 'document').map(f =>
                    f.id === file.id ? { ...f, title: oldTitle } : f
                ), false);
            mutate(`/api/projects/${projectId}/canvases`,
                files.filter(f => f.type === 'canvas').map(f =>
                    f.id === file.id ? { ...f, title: oldTitle } : f
                ), false);
            alert('Failed to rename. Please try again.');
        }
    };

    const cancelRename = () => {
        setEditingId(null);
        setEditingTitle('');
    };

    const deleteFile = async (file: any) => {
        if (!confirm(`Are you sure you want to delete "${file.title}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const endpoint = file.type === 'document'
                ? `/api/documents/${file.id}`
                : `/api/canvas/${file.id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            // Update SWR cache
            mutate(`/api/projects/${projectId}/documents`);
            mutate(`/api/projects/${projectId}/canvases`);
            mutateAll();
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete. Please try again.');
        }
    };

    // Project editing functions
    const startEditingProject = () => {
        setEditingProject(true);
        setProjectName(project?.name || '');
        setProjectDescription(project?.description || '');
    };

    const saveProjectChanges = async () => {
        if (!projectName.trim()) return;

        const oldName = project?.name;
        const oldDescription = project?.description;

        // Optimistic update
        setEditingProject(false);

        try {
            // Update cache optimistically
            mutate(`/api/projects/${projectId}`, {
                ...project,
                name: projectName.trim(),
                description: projectDescription.trim()
            }, false);

            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: projectName.trim(),
                    description: projectDescription.trim()
                }),
            });

            if (!response.ok) throw new Error('Failed to update project');

            // Revalidate to get fresh data
            mutate(`/api/projects/${projectId}`);
        } catch (error) {
            console.error('Failed to update project:', error);
            // Revert optimistic update
            mutate(`/api/projects/${projectId}`, {
                ...project,
                name: oldName,
                description: oldDescription
            }, false);
            setProjectName(oldName || '');
            setProjectDescription(oldDescription || '');
            alert('Failed to update project. Please try again.');
        }
    };

    const cancelProjectEdit = () => {
        setEditingProject(false);
        setProjectName(project?.name || '');
        setProjectDescription(project?.description || '');
    };

    const FileItem = ({ file }: { file: any }) => {
        const Icon = file.type === 'canvas' ? PencilRuler : FileText;
        const isActive = activeFileId === file.id;
        const isEditing = editingId === file.id;

        if (isEditing) {
            return (
                <div className="flex items-center gap-3 p-2 rounded-lg border border-primary/20">
                    <Icon className="w-4 h-4 flex-shrink-0 text-primary" />
                    <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(file);
                            if (e.key === 'Escape') cancelRename();
                        }}
                        onBlur={() => saveRename(file)}
                        className="h-6 text-sm flex-1"
                        autoFocus
                    />
                </div>
            );
        }

        return (
            <div
                className={cn(
                    "group flex items-center gap-3 p-2 rounded-md cursor-pointer",
                    "hover:bg-muted/30",
                    isActive && "bg-primary/5 border-l-2 border-primary"
                )}
                onClick={() => !isEditing && handleFileClick(file)}
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
                        {/* <Clock className="w-3 h-3" /> */}
                        {formatDate(file.updatedAt)}
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleFileClick(file)}>
                            Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            startRename(file);
                        }}>
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            // Open file first
                            handleFileClick(file);
                            // Then toggle fullscreen after a brief delay
                            setTimeout(() => {
                                const { toggleFullscreen } = useWorkspaceStore.getState();
                                toggleFullscreen();
                            }, 50);
                        }}>
                            <Maximize className="w-4 h-4 mr-2" />
                            Open Fullscreen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteFile(file)}
                        >
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
                {/* Project Info */}
                <div className="mb-4">
                    {editingProject ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="h-8 font-semibold"
                                    placeholder="Project name"
                                    autoFocus
                                />
                            </div>
                            <Textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                className="min-h-[60px] text-sm resize-none"
                                placeholder="Project description (optional)"
                            />
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    onClick={saveProjectChanges}
                                    className="h-7 px-2"
                                >
                                    <Check className="w-3 h-3" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelProjectEdit}
                                    className="h-7 px-2"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Folder className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    <h2 className="font-semibold truncate text-sm">{project?.name}</h2>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={startEditingProject}
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                >
                                    <Edit2 className="w-3 h-3" />
                                </Button>
                            </div>
                            {project?.description && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {project.description}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Create File Button */}
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Files
                    </span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Plus className="w-3 h-3" />
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
                <div className="py-1 space-y-6">
                    {isLoading ? (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-2">
                                    <div className="w-4 h-4 bg-muted/50 rounded" />
                                    <div className="flex-1 space-y-1">
                                        <div className="h-3 bg-muted/50 rounded" />
                                        <div className="h-2 bg-muted/30 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* All Files - Simplified */}
                            <div className="space-y-1">
                                {filteredFiles.map((file) => (
                                    <FileItem key={file.id} file={file} />
                                ))}
                            </div>

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