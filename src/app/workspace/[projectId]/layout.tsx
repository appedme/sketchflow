'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WorkspaceSidebar } from '@/components/workspace/WorkspaceSidebar';
import { WorkspaceHeader } from '@/components/workspace/WorkspaceHeader';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { useProjectData } from '@/lib/hooks/useProjectData';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface WorkspaceLayoutProps {
    children: React.ReactNode;
}

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
    const params = useParams();
    const projectId = params.projectId as string;

    const [isMobile, setIsMobile] = useState(false);
    const {
        sidebarVisible,
        sidebarWidth,
        setSidebarWidth,
        initializeWorkspace,
        fullscreenMode
    } = useWorkspaceStore();

    const { data: project, isLoading: projectLoading } = useProjectData(projectId);

    // Initialize workspace on mount
    useEffect(() => {
        if (projectId) {
            initializeWorkspace(projectId);
        }
    }, [projectId, initializeWorkspace]);

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Global keyboard shortcuts for fullscreen
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // F11 or Cmd/Ctrl + Shift + F for fullscreen toggle
            if (event.key === 'F11' ||
                ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'F')) {
                event.preventDefault();
                const { toggleFullscreen } = useWorkspaceStore.getState();
                toggleFullscreen();
            }
            // Escape to exit fullscreen
            if (event.key === 'Escape' && fullscreenMode) {
                event.preventDefault();
                const { toggleFullscreen } = useWorkspaceStore.getState();
                toggleFullscreen();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [fullscreenMode]);

    if (projectLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <div>
                        <h3 className="font-semibold">Loading Workspace</h3>
                        <p className="text-sm text-muted-foreground">Setting up your project...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-4">
                    <h3 className="font-semibold text-lg">Project Not Found</h3>
                    <p className="text-muted-foreground">The requested project could not be found.</p>
                </div>
            </div>
        );
    }

    // Mobile layout - simplified
    if (isMobile) {
        return (
            <div className="h-screen flex flex-col bg-background">
                <WorkspaceHeader
                    project={project}
                    isMobile={true}
                />
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        );
    }

    // Fullscreen mode - hide all UI
    if (fullscreenMode) {
        return (
            <div className="h-screen bg-background">
                {children}
            </div>
        );
    }

    // Desktop layout with resizable panels
    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Header */}
            <WorkspaceHeader
                project={project}
                isMobile={false}
            />

            {/* Main workspace area */}
            <div className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    {/* Sidebar */}
                    {sidebarVisible && (
                        <>
                            <ResizablePanel
                                defaultSize={sidebarWidth}
                                minSize={15}
                                maxSize={40}
                                onResize={(size) => setSidebarWidth(size)}
                                className="bg-card border-r"
                            >
                                <WorkspaceSidebar
                                    projectId={projectId}
                                    project={project}
                                />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                        </>
                    )}

                    {/* Main content area */}
                    <ResizablePanel
                        defaultSize={sidebarVisible ? 100 - sidebarWidth : 100}
                        minSize={50}
                        className="overflow-hidden"
                    >
                        {children}
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </div>
    );
}