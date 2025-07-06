"use client";

import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { ProjectWorkspaceLoading } from './ProjectWorkspaceLoading';
import { DocumentPanel } from './DocumentPanel';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, FileText, Share, Save } from 'lucide-react';

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
          <Button variant="ghost" size="sm" className="gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="w-4 h-4" />
            Share
          </Button>
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
        
        {/* Future: Docs panel will slide in from left when showDocumentPanel is true */}
        {showDocumentPanel && (
          <div className="absolute left-0 top-0 w-96 h-full bg-white border-r border-gray-200 shadow-lg z-20">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Documentation</h2>
              <p className="text-gray-600">Documentation panel coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// https://github.com/excalidraw/excalidraw/tree/master/examples/with-nextjs