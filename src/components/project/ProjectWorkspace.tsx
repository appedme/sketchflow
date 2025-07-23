"use client";

import { useState, useEffect } from 'react';
import { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { Save, Copy, Eye, Globe, ArrowLeft, SplitSquareHorizontal } from 'lucide-react';
import { DocumentationPanel } from './DocumentationPanel';
import { ShareDialog } from './ShareDialog';
import { SplitViewWorkspace } from './SplitViewWorkspace';
import { FullScreenDocumentEditor } from './FullScreenDocumentEditor';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Use optimized lazy loading for better performance
import { LazyExcalidrawCanvas } from '@/components/optimized/LazyExcalidrawCanvas';
import { ExcalidrawCanvas } from './ExcalidrawCanvas';

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

  // Clone project function using SWR
  const handleCloneProject = async () => {
    if (!currentUser) {
      // Redirect to sign in with return URL if not authenticated
      window.location.href = `/handler/sign-in?after_auth_return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`;
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

      const result = await response.json() as { projectId: string };

      // Update SWR cache for projects list if needed
      mutate('/api/projects');

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

      // Update project last activity timestamp in SWR cache
      mutate(`/api/projects/${projectId}`);

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
    <div className="h-full flex flex-col bg-background">
      {/* Clean Top Bar */}
      <div className="h-12 border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <DocumentationPanel
              projectId={projectId}
              projectName={projectName}
              isMobile={true}
            />
          )}
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
                  onClick={() => window.location.href = `/handler/sign-in?after_auth_return_to=${encodeURIComponent(window.location.pathname + window.location.search)}`}
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

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Documentation Panel - Only show on desktop */}
          {/* {!isMobile && (
            <>
              <ResizablePanel
                defaultSize={20}
                minSize={15}
                maxSize={40}
                className="bg-background border-r"
              >
                <DocumentationPanel
                  projectId={projectId}
                  projectName={projectName}
                  isMobile={false}
                />
              </ResizablePanel>

              <ResizableHandle withHandle />
            </>
          )} */}

          {/* Main Canvas Area */}
          <ResizablePanel
            defaultSize={isMobile ? 100 : 80}
            minSize={60}
            className="relative overflow-hidden"
          >
            <LazyExcalidrawCanvas
              projectId={projectId}
              projectName={projectName}
              isReadOnly={isReadOnly}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
// https://github.com/excalidraw/excalidraw/tree/master/examples/with-nextjs