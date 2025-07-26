'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { DocumentationPanel } from '@/components/project/DocumentationPanel';
import { ProjectNavigation } from '@/components/project/ProjectNavigation';
import { cn } from '@/lib/utils';
import { useUser } from '@stackframe/stack';
import { useCachedApi } from '@/hooks/useCachedApi';

interface ProjectLayoutProps {
    children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
    const params = useParams();
    const pathname = usePathname();
    const projectId = params.id as string;
    const [showDocumentPanel, setShowDocumentPanel] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isCreatingDocument, setIsCreatingDocument] = useState(false);
    const [isCreatingCanvas, setIsCreatingCanvas] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const user = useUser();
    const { data: project } = useCachedApi<any>(projectId ? `/api/projects/${projectId}` : null);

    // Check if we're on mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Don't show unified navigation on settings page
    const shouldShowUnifiedNav = !pathname.includes('/settings');
    const shouldShowPanel = !pathname.includes('/settings');

    // Mobile view - simplified layout
    if (isMobile) {
        return <>{children}</>;
    }

    // Settings page - no unified navigation
    if (!shouldShowUnifiedNav) {
        return <>{children}</>;
    }

    // Handle save all
    const handleSave = async () => {
        setSaving(true);
        try {
            // Trigger save events
            const saveEvent = new CustomEvent('excalidraw-save-all');
            window.dispatchEvent(saveEvent);
            const docSaveEvent = new CustomEvent('document-save-all');
            window.dispatchEvent(docSaveEvent);

            // Update project timestamp
            await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lastActivity: new Date().toISOString() }),
            });

            setTimeout(() => setSaving(false), 1000);
        } catch (error) {
            console.error('Save failed:', error);
            setSaving(false);
        }
    };

    // Handle create document
    const handleCreateDocument = async () => {
        setIsCreatingDocument(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/documents`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Untitled Document',
                    content: { type: 'doc', content: [] },
                }),
            });

            if (response.ok) {
                // Refresh documents list
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to create document:', error);
        } finally {
            setIsCreatingDocument(false);
        }
    };

    // Handle create canvas
    const handleCreateCanvas = async () => {
        setIsCreatingCanvas(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/canvases`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Untitled Canvas',
                    elements: [],
                    appState: {},
                }),
            });

            if (response.ok) {
                // Refresh canvases list
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to create canvas:', error);
        } finally {
            setIsCreatingCanvas(false);
        }
    };

    // Handle export
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/export`);
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project?.name || 'project'}-export.json`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
    };

    // Determine if this is a public view
    const isPublicView = !user || (project && project.ownerId !== user.id && project.visibility === 'public');
    const isReadOnly = isPublicView || (project && project.ownerId !== user.id && !['owner', 'editor'].includes(project.userRole || 'viewer'));

    return (
        <div className="h-screen flex flex-col bg-background">
            {/* Unified Navigation */}
            <ProjectNavigation
                projectId={projectId}
                projectName={project?.name || 'Project'}
                currentUser={user}
                project={project}
                isReadOnly={isReadOnly}
                isPublicView={isPublicView}
                showDocumentPanel={showDocumentPanel}
                onToggleDocumentPanel={() => setShowDocumentPanel(!showDocumentPanel)}
                onSave={handleSave}
                onCreateDocument={handleCreateDocument}
                onCreateCanvas={handleCreateCanvas}
                onExport={handleExport}
                saving={saving}
                isCreatingDocument={isCreatingDocument}
                isCreatingCanvas={isCreatingCanvas}
                isExporting={isExporting}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Document Panel */}
                {shouldShowPanel && (
                    <div className={cn(
                        "border-r bg-card flex-shrink-0 overflow-hidden transition-all duration-300",
                        showDocumentPanel ? "w-80" : "w-0"
                    )}>
                        {showDocumentPanel && (
                            <DocumentationPanel
                                projectId={projectId}
                                projectName={project?.name || 'Project'}
                                className="h-full"
                            />
                        )}
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}