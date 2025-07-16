"use client";

import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { ProjectWorkspaceLoading } from './ProjectWorkspaceLoading';
import { DocumentPanel } from './DocumentPanel';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeftOpen, PanelLeftClose, FileText, Share, Save, ArrowLeft, SplitSquareHorizontal } from 'lucide-react';
import { DocumentationPanel } from './DocumentationPanel';
import { ShareDialog } from './ShareDialog';
import { SplitViewWorkspace } from './SplitViewWorkspace';
import { FullScreenDocumentEditor } from './FullScreenDocumentEditor';

// Dynamically import Excalidraw to avoid SSR issues
const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then(mod => mod.ExcalidrawCanvas),
  {
    ssr: false,
    loading: () => <ProjectWorkspaceLoading />
  }
);

interface ProjectWorkspaceProps {
  projectId: string;
  projectName: string;
  isReadOnly?: boolean;
}

export function ProjectWorkspace({
  projectId,
  projectName,
  isReadOnly = false
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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSave = async () => {
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
        <div className="h-screen flex flex-col bg-gray-50">
          {/* Full Screen Header for Canvas */}
          <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
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
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="font-semibold text-lg text-gray-900">Canvas - Full Screen</h1>
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
          <ShareDialog projectId={projectId} projectName={projectName} />
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
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <ExcalidrawCanvas
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