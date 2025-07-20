"use client";

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { ProjectWorkspaceLoading } from './ProjectWorkspaceLoading';
import { DocumentPanel } from './DocumentPanel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeftOpen, PanelLeftClose, FileText, Share, Save, ArrowLeft, SplitSquareHorizontal, Copy, Eye, Lock, Globe } from 'lucide-react';
import { DocumentationPanel } from './DocumentationPanel';
import { ShareDialog } from './ShareDialog';
import { SplitViewWorkspace } from './SplitViewWorkspace';
import { FullScreenDocumentEditor } from './FullScreenDocumentEditor';

// Use optimized lazy loading for better performance
import { LazyExcalidrawCanvas } from '@/components/optimized/LazyExcalidrawCanvas';
import { LazyPlateEditor } from '@/components/optimized/LazyPlateEditor';
import { useComponentPreloader } from '@/components/optimized/PreloadManager';

interface ProjectWorkspaceProps {
  projectId: string;
  projectName: string;
  isReadOnly?: boolean;
  isPublicView?: boolean;
  project?: any;
  currentUser?: any;
}

export function ProjectWorkspace({
  projectId,
  projectName,
  isReadOnly = false,
  isPublicView = false,
  project,
  currentUser
}: ProjectWorkspaceProps) {
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [splitViewMode, setSplitViewMode] = useState(false);
  const [splitViewItem, setSplitViewItem] = useState<{
    id: string;
    type: 'document' | 'canvas';
  } | null>(null);
  const [fullScreenItem, setFullScreenItem] = useState<{
    id: string;
    type: 'document' | 'canvas';
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  // Clone project function
  const handleCloneProject = async () => {
    if (!currentUser) {
      // Redirect to sign in with return URL if not authenticated
      window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsCloning(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/clone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to clone project');
      }

      const result = await response.json();
      // Redirect to the new cloned project
      window.location.href = `/project/${result.projectId}`;
    } catch (error) {
      console.error('Error cloning project:', error);
      alert('Failed to clone project. Please try again.');
    } finally {
      setIsCloning(false);
    }
  };

  // Copy current URL to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  // Handle save function
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setSaving(true);
    try {
      // Trigger save for the current canvas
      const event = new CustomEvent('excalidraw-save');
      window.dispatchEvent(event);

      // Show feedback
      setTimeout(() => setSaving(false), 1000);
    } catch (error) {
      console.error('Save failed:', error);
      setSaving(false);
    }
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle split view mode
  if (splitViewMode && splitViewItem) {
    return (
      <SplitViewWorkspace
        projectId={projectId}
        projectName={projectName}
        leftItemId={splitViewItem.id}
        leftItemType={splitViewItem.type}
        rightItemId={projectId}
        rightItemType="canvas"
      // onClose={() => {
      //   setSplitViewMode(false);
      //   setSplitViewItem(null);
      // }}
      />
    );
  }

  // Handle full screen mode
  if (fullScreenItem) {
    if (fullScreenItem.type === 'document') {
      return (
        <FullScreenDocumentEditor
          projectId={projectId}
          documentId={fullScreenItem.id}
          projectName={projectName}
        />
      );
    } else {
      return (
        <div className="h-screen flex flex-col bg-background">
          {/* Full Screen Header for Canvas */}
          <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullScreenItem(null)}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="font-semibold text-lg text-foreground">Canvas - Full Screen</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSplitViewItem(fullScreenItem);
                  setSplitViewMode(true);
                  setFullScreenItem(null);
                }}
                className="gap-2"
              >
                <SplitSquareHorizontal className="w-4 h-4" />
                Split View
              </Button>
            </div>
          </div>

          {/* Full Screen Canvas Content */}
          <div className="flex-1">
            <ExcalidrawCanvas
              projectId={fullScreenItem.id}
              projectName={projectName}
              isReadOnly={isReadOnly}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Clean Top Bar */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {isMobile ? (
            <DocumentationPanel
              projectId={projectId}
              projectName={projectName}
              isMobile={true}
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDocumentPanel(!showDocumentPanel)}
              className="gap-2"
            >
              {showDocumentPanel ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
              Files
            </Button>
          )}
          <div className="h-4 w-px bg-border" />
          <h1 className="font-medium text-sm truncate">{projectName}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isPublicView ? (
            <>
              {/* Public view controls */}
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs">
                {project?.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {project?.visibility === 'public' ? 'Public' : 'View Only'}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
              {currentUser && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleCloneProject}
                  disabled={isCloning}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  {isCloning ? 'Cloning...' : 'Clone Project'}
                </Button>
              )}
              {!currentUser && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => window.location.href = `/sign-in?redirect=${encodeURIComponent(window.location.pathname)}`}
                  className="gap-2"
                >
                  Sign In to Clone
                </Button>
              )}
            </>
          ) : (
            <>
              {/* Edit mode controls */}
              <ShareDialog 
                projectId={projectId} 
                projectName={projectName} 
                projectVisibility={project?.visibility}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={saving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <LazyExcalidrawCanvas
          projectId={projectId}
          projectName={projectName}
          isReadOnly={isReadOnly}
        />

        {/* Desktop Documentation Panel */}
        {!isMobile && showDocumentPanel && (
          <div className="absolute left-0 top-0 w-80 h-full bg-background border-r z-20">
            <DocumentationPanel
              projectId={projectId}
              projectName={projectName}
            />
          </div>
        )}
      </div>
    </div>
  );
}
// https://github.com/excalidraw/excalidraw/tree/master/examples/with-nextjs