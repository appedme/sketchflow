"use client";

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { ProjectWorkspaceLoading } from './ProjectWorkspaceLoading';
import { DocumentPanel } from './DocumentPanel';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, FileText, Share, Save, ArrowLeft, SplitSquareHorizontal } from 'lucide-react';
import { DocumentationPanel } from './DocumentationPanel';
import { ShareDialog } from './ShareDialog';
import { SplitViewWorkspace } from './SplitViewWorkspace';

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
        onClose={() => {
          setSplitViewMode(false);
          setSplitViewItem(null);
        }}
      />
    );
  }

  // Handle full screen mode
  if (fullScreenItem) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Full Screen Header */}
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
            <h1 className="font-semibold text-lg text-gray-900">
              {fullScreenItem.type === 'document' ? 'Document' : 'Canvas'} - Full Screen
            </h1>
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

        {/* Full Screen Content */}
        <div className="flex-1">
          {fullScreenItem.type === 'document' ? (
            <DocumentationPanel
              projectId={projectId}
              selectedItemId={fullScreenItem.id}
              onSplitView={(itemId, itemType) => {
                setSplitViewItem({ id: itemId, type: itemType });
                setSplitViewMode(true);
                setFullScreenItem(null);
              }}
              onFullScreen={() => {}} // Already in full screen
              onClosePanel={() => setFullScreenItem(null)}
            />
          ) : (
            <ExcalidrawCanvas
              projectId={fullScreenItem.id}
              projectName={projectName}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top Toolbar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDocumentPanel(!showDocumentPanel)}
            className="gap-2"
          >
            <PanelLeftOpen className="w-4 h-4" />
            Docs
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="font-semibold text-lg text-gray-900">{projectName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <ShareDialog projectId={projectId} projectName={projectName} />
          <Button size="sm" className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Content Area - Full Screen Excalidraw */}
      <div className="flex-1 relative">
        <ExcalidrawCanvas
          projectId={projectId}
          projectName={projectName}
          isReadOnly={isReadOnly}
        />
        
        {/* Documentation Panel */}
        {showDocumentPanel && (
          <div className="absolute left-0 top-0 w-2/3 h-full bg-white border-r border-gray-200 shadow-lg z-20">
            <DocumentationPanel
              projectId={projectId}
              onSplitView={(itemId, itemType) => {
                setSplitViewItem({ id: itemId, type: itemType });
                setSplitViewMode(true);
                setShowDocumentPanel(false);
              }}
              onFullScreen={(itemId, itemType) => {
                setFullScreenItem({ id: itemId, type: itemType });
                setShowDocumentPanel(false);
              }}
              onClosePanel={() => setShowDocumentPanel(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
// https://github.com/excalidraw/excalidraw/tree/master/examples/with-nextjs