"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    PanelLeftOpen,
    PanelLeftClose,
    Save,
    Settings,
    MoreHorizontal,
    Maximize,
    Minimize,
    EyeOff,
    Eye,
    Download
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface WorkspaceHeaderProps {
    project: any;
    isMobile: boolean;
    isReadOnly?: boolean;
}

export function WorkspaceHeader({ project, isMobile, isReadOnly = false }: WorkspaceHeaderProps) {
    const router = useRouter();
    const {
        sidebarVisible,
        toggleSidebar,
        openFiles,
        activeFileId,
        fullscreenMode,
        toggleFullscreen
    } = useWorkspaceStore();

    const activeFile = activeFileId ? openFiles[activeFileId] : null;
    const hasUnsavedChanges = Object.values(openFiles).some(file => file.isDirty);

    const handleSaveAll = async () => {
        // Trigger save event for all editors
        const saveEvent = new CustomEvent('workspace-save-all');
        window.dispatchEvent(saveEvent);
    };

    // Add Ctrl+S keyboard shortcut
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();
                handleSaveAll();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleSaveAll]);



    const handleSettings = () => {
        router.push(`/project/${project.id}/settings`);
    };

    const handleExportProject = async () => {
        try {
            const response = await fetch(`/api/export/project?projectId=${project.id}`);
            if (!response.ok) {
                throw new Error('Export failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}_export.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            // You could add a toast notification here
        }
    };

    return (
        <div className="h-12 bg-background border-b flex items-center justify-between px-4">
            {/* Left side */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/dashboard')}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {/* {!isMobile && 'Dashboard'} */}
                </Button>

                {!isMobile && (
                    <>
                        <div className="w-px h-6 bg-border" />

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleSidebar}
                            title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
                        >
                            {sidebarVisible ? (
                                <PanelLeftClose className="w-4 h-4" />
                            ) : (
                                <PanelLeftOpen className="w-4 h-4" />
                            )}
                        </Button>
                    </>
                )}

                <div className="flex items-center gap-2">
                    <h1 className="font-semibold text-lg truncate max-w-[200px]">
                        {project.name}
                    </h1>
                    {activeFile && (
                        <>
                            <span className="text-muted-foreground">/</span>
                            <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                                {activeFile.title}
                            </span>
                            {activeFile.isDirty && (
                                <span className="text-xs text-orange-500">•</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
                {/* Auto-save Status */}
                {!isReadOnly && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        {hasUnsavedChanges ? (
                            <>
                                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                <span>Saved</span>
                            </>
                        )}
                    </div>
                )}

                {/* Fullscreen Toggle */}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleFullscreen}
                    title={fullscreenMode ? 'Exit fullscreen (Esc, F11, or Ctrl+Shift+F)' : 'Enter fullscreen (F11 or Ctrl+Shift+F)'}
                >
                    {fullscreenMode ? (
                        <Minimize className="w-4 h-4" />
                    ) : (
                        <Maximize className="w-4 h-4" />
                    )}
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={toggleFullscreen}>
                            {fullscreenMode ? (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Show All UI
                                    <span className="ml-auto text-xs text-muted-foreground">Esc</span>
                                </>
                            ) : (
                                <>
                                    <EyeOff className="w-4 h-4 mr-2" />
                                    Hide All UI
                                    <span className="ml-auto text-xs text-muted-foreground">F11</span>
                                </>
                            )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSettings}>
                            <Settings className="w-4 h-4 mr-2" />
                            Project Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleExportProject}>
                            <Download className="w-4 h-4 mr-2" />
                            Export Project
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Duplicate Project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            Delete Project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}