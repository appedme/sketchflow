"use client";

import React, { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { useFileData } from '@/lib/hooks/useFileData';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { WorkspaceEditor } from './WorkspaceEditor';
import { WorkspaceTabs } from './WorkspaceTabs';
import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkspaceShellProps {
    projectId: string;
    primaryFileId: string;
    splitFileIds?: string[];
    layout?: 'horizontal' | 'vertical';
    project: any;
    currentUser: any;
    isReadOnly?: boolean;
    isPublicView?: boolean;
}

export function WorkspaceShell({
    projectId,
    primaryFileId,
    splitFileIds = [],
    layout = 'horizontal',
    project,
    currentUser,
    isReadOnly = false,
    isPublicView = false,
}: WorkspaceShellProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const {
        panels,
        openFiles,
        activeFileId,
        layout: storeLayout,
        openFile,
        setActiveFile,
        setLayout,
        addPanel,
        removePanel,
        resizePanel,
    } = useWorkspaceStore();

    // Get file data for primary file to determine type
    const { data: primaryFileData } = useFileData(primaryFileId, null);

    // Initialize primary file when component mounts
    useEffect(() => {
        if (primaryFileData) {
            openFile(primaryFileId, primaryFileData.type, primaryFileData.title);
            setActiveFile(primaryFileId);
        }
    }, [primaryFileId, primaryFileData, openFile, setActiveFile]);

    // Handle split files from URL
    useEffect(() => {
        splitFileIds.forEach(fileId => {
            // We'll need to fetch file type for each split file
            // For now, we'll handle this in the individual file components
        });
    }, [splitFileIds]);

    // Update layout from URL
    useEffect(() => {
        if (layout !== storeLayout) {
            setLayout(layout);
        }
    }, [layout, storeLayout, setLayout]);

    // Handle panel resize
    const handlePanelResize = (panelId: string, size: number) => {
        resizePanel(panelId, size);
    };

    // Add new panel
    const handleAddPanel = () => {
        if (activeFileId && openFiles[activeFileId]) {
            const file = openFiles[activeFileId];
            addPanel(activeFileId, file.type);
        }
    };

    // Remove panel
    const handleRemovePanel = (panelId: string) => {
        removePanel(panelId);
    };

    // Update URL when panels change
    const updateURL = () => {
        const params = new URLSearchParams(searchParams);

        if (panels.length > 1) {
            const splitIds = panels.slice(1).map(p => p.fileId);
            params.set('split', splitIds.join(','));
        } else {
            params.delete('split');
        }

        if (storeLayout !== 'horizontal') {
            params.set('layout', storeLayout);
        } else {
            params.delete('layout');
        }

        const newURL = `${window.location.pathname}?${params.toString()}`;
        router.replace(newURL, { scroll: false });
    };

    // Update URL when panels change (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(updateURL, 500);
        return () => clearTimeout(timeoutId);
    }, [panels, storeLayout]);

    // Render panels
    const renderPanels = () => {
        if (panels.length === 0) {
            return (
                <div className="h-full flex items-center justify-center bg-muted/20">
                    <div className="text-center space-y-4">
                        <div className="text-muted-foreground">
                            <LayoutGrid className="w-12 h-12 mx-auto mb-2" />
                            <p>No files open</p>
                        </div>
                    </div>
                </div>
            );
        }

        if (panels.length === 1) {
            const panel = panels[0];
            return (
                <WorkspaceEditor
                    key={panel.id}
                    fileId={panel.fileId}
                    fileType={panel.type}
                    projectId={projectId}
                    isReadOnly={isReadOnly}
                    isActive={activeFileId === panel.fileId}
                    onActivate={() => setActiveFile(panel.fileId)}
                />
            );
        }

        // Multiple panels - use resizable layout
        return (
            <ResizablePanelGroup
                direction={storeLayout}
                className="h-full"
            >
                {panels.map((panel, index) => (
                    <React.Fragment key={panel.id}>
                        <ResizablePanel
                            defaultSize={panel.size}
                            minSize={20}
                            onResize={(size) => handlePanelResize(panel.id, size)}
                            className="relative"
                        >
                            {/* Panel header with close button */}
                            <div className="h-8 bg-muted/50 border-b flex items-center justify-between px-2">
                                <span className="text-xs font-medium truncate">
                                    {openFiles[panel.fileId]?.title || 'Untitled'}
                                </span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemovePanel(panel.id)}
                                    className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                            </div>

                            {/* Editor content */}
                            <div className="h-[calc(100%-2rem)]">
                                <WorkspaceEditor
                                    fileId={panel.fileId}
                                    fileType={panel.type}
                                    projectId={projectId}
                                    isReadOnly={isReadOnly}
                                    isActive={activeFileId === panel.fileId}
                                    onActivate={() => setActiveFile(panel.fileId)}
                                />
                            </div>
                        </ResizablePanel>

                        {index < panels.length - 1 && <ResizableHandle withHandle />}
                    </React.Fragment>
                ))}
            </ResizablePanelGroup>
        );
    };

    return (
        <div className="h-full flex flex-col bg-background">
            {/* Workspace tabs and controls */}
            <div className="h-10 bg-card border-b flex items-center justify-between px-2">
                <WorkspaceTabs />

                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleAddPanel}
                        disabled={!activeFileId || panels.length >= 3}
                        title="Split panel"
                        className="h-7 px-2"
                    >
                        <Plus className="w-3 h-3" />
                    </Button>

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setLayout(storeLayout === 'horizontal' ? 'vertical' : 'horizontal')}
                        title={`Switch to ${storeLayout === 'horizontal' ? 'vertical' : 'horizontal'} layout`}
                        className="h-7 px-2"
                    >
                        <LayoutGrid className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Main editor area */}
            <div className="flex-1 overflow-hidden">
                {renderPanels()}
            </div>
        </div>
    );
}