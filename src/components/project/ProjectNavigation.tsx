"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Home,
    PanelLeftOpen,
    PanelLeftClose,
    Moon,
    Sun,
    Save,
    Share,
    Copy,
    Eye,
    Globe,
    Settings,
    MoreHorizontal,
    Plus,
    FileText,
    Palette,
    Download,
    Loader2,
    ArrowLeft,
    RefreshCw,
    Maximize,
    SplitSquareHorizontal
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { ViewTracker } from './ViewTracker';
import { ShareDialog } from './ShareDialog';

interface ProjectNavigationProps {
    projectId: string;
    projectName: string;
    currentUser?: any;
    project?: any;
    isReadOnly?: boolean;
    isPublicView?: boolean;
    showDocumentPanel: boolean;
    onToggleDocumentPanel: () => void;
    onSave?: () => void;
    onCreateDocument?: () => void;
    onCreateCanvas?: () => void;
    onExport?: () => void;
    saving?: boolean;
    isCreatingDocument?: boolean;
    isCreatingCanvas?: boolean;
    isExporting?: boolean;
}

export function ProjectNavigation({
    projectId,
    projectName,
    currentUser,
    project,
    isReadOnly = false,
    isPublicView = false,
    showDocumentPanel,
    onToggleDocumentPanel,
    onSave,
    onCreateDocument,
    onCreateCanvas,
    onExport,
    saving = false,
    isCreatingDocument = false,
    isCreatingCanvas = false,
    isExporting = false,
}: ProjectNavigationProps) {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isCloning, setIsCloning] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isOwner = currentUser && project && project.ownerId === currentUser.id;

    const handleCloneProject = async () => {
        if (!currentUser) {
            window.location.href = `/handler/sign-in?after_auth_return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`;
            return;
        }

        setIsCloning(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/clone`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) throw new Error('Failed to clone project');

            const result = await response.json() as { projectId: string };
            window.location.href = `/project/${result.projectId}`;
        } catch (error) {
            console.error('Error cloning project:', error);
            alert('Failed to clone project. Please try again.');
        } finally {
            setIsCloning(false);
        }
    };

    const handleCopyUrl = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
        } catch (error) {
            console.error('Failed to copy URL:', error);
        }
    };

    const goToDashboard = () => {
        router.push('/dashboard');
    };

    const goToSettings = () => {
        router.push(`/project/${projectId}/settings`);
    };

    return (
        <div className="h-12 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 z-10">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Back to Dashboard */}
                {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToDashboard}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <Home className="w-4 h-4" />
                </Button> */}



                {/* Project Name */}
                <div className="flex items-center gap-2">
                    <h1 className="font-medium text-sm truncate max-w-[200px]">{projectName}</h1>

                    {/* View Tracker */}
                    <ViewTracker
                        projectId={projectId}
                        userId={currentUser?.id}
                        isOwner={isOwner}
                        showLiveCount={true}
                        className="text-xs"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {isPublicView ? (
                    <>
                        {/* Public View Indicator */}
                        <Badge variant="secondary" className="gap-1">
                            {project?.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {project?.visibility === 'public' ? 'Public' : 'View Only'}
                        </Badge>

                        {/* Copy Link */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCopyUrl}
                            className="gap-2"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </Button>

                        {/* Clone Project */}
                        {currentUser ? (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={handleCloneProject}
                                disabled={isCloning}
                                className="gap-2"
                            >
                                <Copy className="w-4 h-4" />
                                {isCloning ? 'Cloning...' : 'Clone'}
                            </Button>
                        ) : (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => window.location.href = `/handler/sign-in?after_auth_return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`}
                                className="gap-2"
                            >
                                Sign In to Clone
                            </Button>
                        )}
                    </>
                ) : (
                    <>
                        {/* Create Menu */}
                        {currentUser && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline" className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        New
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem
                                        onClick={onCreateDocument}
                                        className="gap-2"
                                        disabled={isCreatingDocument}
                                    >
                                        {isCreatingDocument ? (
                                            <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                                        ) : (
                                            <FileText className="h-4 w-4 text-blue-500" />
                                        )}
                                        {isCreatingDocument ? 'Creating...' : 'Document'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={onCreateCanvas}
                                        className="gap-2"
                                        disabled={isCreatingCanvas}
                                    >
                                        {isCreatingCanvas ? (
                                            <Loader2 className="h-4 w-4 text-purple-500 animate-spin" />
                                        ) : (
                                            <Palette className="h-4 w-4 text-purple-500" />
                                        )}
                                        {isCreatingCanvas ? 'Creating...' : 'Canvas'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}

                        {/* Save Button */}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onSave}
                            disabled={saving || isReadOnly}
                            className="gap-2"
                        >
                            {saving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {saving ? 'Saving...' : 'Save'}
                        </Button>

                        {/* Share Dialog */}
                        <ShareDialog
                            projectId={projectId}
                            projectName={projectName}
                            projectVisibility={project?.visibility}
                        />

                        {/* Files Panel Toggle */}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleDocumentPanel}
                            className="gap-2"
                        >
                            {showDocumentPanel ? (
                                <PanelLeftClose className="w-4 h-4" />
                            ) : (
                                <PanelLeftOpen className="w-4 h-4" />
                            )}
                            Files
                        </Button>

                        {/* View Options */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline" className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    View
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {/* Split View */}
                                <DropdownMenuItem
                                    onClick={() => {
                                        const currentPath = window.location.pathname;
                                        if (currentPath.includes('/document/') || currentPath.includes('/canvas/')) {
                                            const pathParts = currentPath.split('/');
                                            const fileId = pathParts[pathParts.length - 1];
                                            const fileType = currentPath.includes('/document/') ? 'document' : 'canvas';
                                            router.push(`/project/${projectId}/split?left=${fileId}&leftType=${fileType}`);
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    <SplitSquareHorizontal className="h-4 w-4" />
                                    Split View
                                </DropdownMenuItem>

                                {/* Full Screen */}
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (!document.fullscreenElement) {
                                            document.documentElement.requestFullscreen();
                                        } else {
                                            document.exitFullscreen();
                                        }
                                    }}
                                    className="gap-2"
                                >
                                    <Maximize className="h-4 w-4" />
                                    Toggle Full Screen
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Canvas Actions */}
                                <DropdownMenuItem
                                    onClick={() => {
                                        const event = new CustomEvent('canvas-fit-to-content');
                                        window.dispatchEvent(event);
                                    }}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Fit to Content
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        const event = new CustomEvent('canvas-reset-zoom');
                                        window.dispatchEvent(event);
                                    }}
                                    className="gap-2"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Reset Zoom
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* More Actions Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {/* Project Actions */}
                                <DropdownMenuItem onClick={onExport} disabled={isExporting} className="gap-2">
                                    {isExporting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Download className="h-4 w-4" />
                                    )}
                                    {isExporting ? 'Exporting...' : 'Export Project'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />

                                {/* Navigation */}
                                <DropdownMenuItem
                                    onClick={() => router.push(`/project/${projectId}`)}
                                    className="gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Project Overview
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={goToSettings} className="gap-2">
                                    <Settings className="h-4 w-4" />
                                    Project Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                )}

                {/* Theme Toggle */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="h-8 w-8 p-0"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-4 w-4" />
                        ) : (
                            <Moon className="h-4 w-4" />
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}