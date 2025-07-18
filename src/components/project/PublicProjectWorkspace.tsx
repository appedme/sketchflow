"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, Menu, X } from 'lucide-react';
import { PublicDocumentationPanel } from './PublicDocumentationPanel';
import { PlateDocumentEditor } from './PlateDocumentEditor';
import dynamic from 'next/dynamic';
import { Loading } from '@/components/loading';

const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then(mod => mod.ExcalidrawCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-background">
        <Loading size="lg" text="Loading canvas..." />
      </div>
    )
  }
);

interface PublicProjectWorkspaceProps {
  project: any;
  shareToken: string;
  shareSettings: any;
  isEmbedded?: boolean;
  embedType?: 'project' | 'document' | 'canvas';
  embedId?: string;
}

export function PublicProjectWorkspace({
  project,
  shareToken,
  shareSettings,
  isEmbedded = false,
  embedType,
  embedId
}: PublicProjectWorkspaceProps) {
  const [showSidebar, setShowSidebar] = useState(!isEmbedded);
  const [currentView, setCurrentView] = useState<'project' | 'document' | 'canvas'>(
    embedType || 'project'
  );
  const [currentItemId, setCurrentItemId] = useState<string | null>(embedId || null);

  const showToolbar = !isEmbedded || shareSettings?.embedSettings?.toolbar !== false;

  const renderContent = () => {
    if (currentView === 'document' && currentItemId) {
      return (
        <PlateDocumentEditor
          documentId={currentItemId}
          projectId={project.id}
          isReadOnly={true}
          shareToken={shareToken}
        />
      );
    } else if (currentView === 'canvas' && currentItemId) {
      return (
        <ExcalidrawCanvas
          canvasId={currentItemId}
          projectId={project.id}
          projectName={project.name}
          isReadOnly={true}
          shareToken={shareToken}
        />
      );
    } else {
      // Default project view - show main canvas or first available item
      return (
        <ExcalidrawCanvas
          projectId={project.id}
          projectName={project.name}
          isReadOnly={true}
          shareToken={shareToken}
        />
      );
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-80 border-r bg-card flex-shrink-0">
          <PublicDocumentationPanel
            project={project}
            shareToken={shareToken}
            className="h-full"
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {showToolbar && (
          <div className="h-12 bg-card border-b flex items-center justify-between px-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              {!showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                  className="p-2"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              )}
              <Eye className="w-4 h-4 text-muted-foreground" />
              <h1 className="font-semibold text-lg text-foreground">{project.name}</h1>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {isEmbedded ? 'Embedded' : 'Public View'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showSidebar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSidebar(false)}
                  className="p-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
              {!isEmbedded && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://sketchflow.space', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Create Your Own
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}