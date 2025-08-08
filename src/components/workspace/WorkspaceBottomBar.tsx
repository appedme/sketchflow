"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import {
    Share,
    Sun,
    Moon,
    Save,
    Users,
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


    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            <div className="h-10 bg-card border-t flex items-center justify-between px-4">
                {/* Left side - Save status */}
                <div className="flex items-center gap-3">
                    {hasUnsavedChanges && !isReadOnly && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="gap-2 h-7"
                        >
                            <Save className="w-3 h-3" />
                            {saving ? 'Saving...' : 'Save All'}
                        </Button>
                    )}

                    <div className="text-xs text-muted-foreground">
                        {hasUnsavedChanges ? (
                            <span className="text-orange-600">Unsaved changes</span>
                        ) : (
                            <span>All changes saved</span>
                        )}
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={toggleTheme}
                        className="h-7 w-7 p-0"
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? (
                            <Sun className="w-3 h-3" />
                        ) : (
                            <Moon className="w-3 h-3" />
                        )}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                                title="More options"
                            >
                                <MoreHorizontal className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleShare}>
                                <Share className="w-4 h-4 mr-2" />
                                Share Project
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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