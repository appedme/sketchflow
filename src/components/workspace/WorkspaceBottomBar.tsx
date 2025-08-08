"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
    Share,
    Sun,
    Moon,
    Save,
    Settings,
    Download,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { ShareDialog } from '@/components/project/ShareDialog';
import { WorkspaceTabs } from './WorkspaceTabs';

interface WorkspaceBottomBarProps {
    projectId: string;
    project: any;
    isReadOnly?: boolean;
}

export function WorkspaceBottomBar({
    projectId,
    project,
    isReadOnly = false
}: WorkspaceBottomBarProps) {
    const { theme, setTheme } = useTheme();
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const { openFiles } = useWorkspaceStore();

    const hasUnsavedChanges = Object.values(openFiles).some(file => file.isDirty);

    const handleSaveAll = async () => {
        setSaving(true);
        try {
            // Trigger save event for all editors
            const saveEvent = new CustomEvent('workspace-save-all');
            window.dispatchEvent(saveEvent);

            setTimeout(() => setSaving(false), 1000);
        } catch (error) {
            console.error('Save failed:', error);
            setSaving(false);
        }
    };

    const handleShare = () => {
        setShareDialogOpen(true);
    };

    const handleExport = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/export`, {
                method: 'GET',
            });

            if (!response.ok) throw new Error('Export failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project?.name || 'project'}-export.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export project. Please try again.');
        }
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <div className="bg-card border-t">
                {/* File Tabs */}

                {/* Bottom Bar */}
                <div className="h-10 flex items-center justify-between px-4">
                    {/* Left side - Save status and button */}
                    <div className="flex items-center gap-3">
                        {Object.keys(openFiles).length > 0 && (
                            <div className="h-10 flex items-center px-4 border-b">
                                <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                                    <WorkspaceTabs />
                                </div>
                            </div>
                        )}
                        {/* Save Button */}
                        {!isReadOnly && (
                            <Button
                                size="sm"
                                variant={hasUnsavedChanges ? "outline" : "ghost"}
                                onClick={handleSaveAll}
                                disabled={saving}
                                className="gap-2 h-7"
                                title="Save all files (Ctrl+S)"
                            >
                                <Save className="w-3 h-3" />
                                {saving ? 'Saving...' : hasUnsavedChanges ? 'Save All' : 'Save'}
                            </Button>
                        )}

                        {/* Status indicator */}
                        <div className="text-xs text-muted-foreground">
                            {hasUnsavedChanges ? (
                                <span className="text-orange-600">Unsaved changes</span>
                            ) : (
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Auto-saved
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={toggleTheme} className="h-7 w-7 p-0" title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
                            {theme === 'dark' ? (
                                <Sun className="w-3 h-3" />
                            ) : (
                                <Moon className="w-3 h-3" />
                            )}
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="More options">
                                    <MoreHorizontal className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {!isReadOnly && (
                                    <>
                                        <DropdownMenuItem
                                            onClick={() => {
                                                // Trigger save for current active file
                                                const saveEvent = new CustomEvent('workspace-save-current');
                                                window.dispatchEvent(saveEvent);
                                            }}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Current File
                                            <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleSaveAll}
                                            disabled={saving}
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {saving ? 'Saving All...' : 'Save All Files'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem onClick={handleShare}>
                                    <Share className="w-4 h-4 mr-2" />
                                    Share Project
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleExport}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Project Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={toggleTheme}>
                                    {theme === 'dark' ? (
                                        <>
                                            <Sun className="w-4 h-4 mr-2" />
                                            Switch to Light Mode
                                        </>
                                    ) : (
                                        <>
                                            <Moon className="w-4 h-4 mr-2" />
                                            Switch to Dark Mode
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {/* Share Dialog */}
            <ShareDialog
                projectId={projectId}
                projectName={project?.name || 'Untitled Project'}
                isOpen={shareDialogOpen}
                onOpenChange={setShareDialogOpen}
                projectVisibility={project?.visibility || 'private'}
            />
        </>
    );
}