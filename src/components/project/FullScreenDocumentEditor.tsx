"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LazyPlateEditor } from '@/components/optimized/LazyPlateEditor';
import { DocumentationPanel } from './DocumentationPanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

interface FullScreenDocumentEditorProps {
  projectId: string;
  documentId: string;
  projectName: string;
  isReadOnly?: boolean;
}

export function FullScreenDocumentEditor({
  projectId,
  documentId,
  projectName,
  isReadOnly = false,
}: FullScreenDocumentEditorProps) {
  const router = useRouter();
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Full screen functionality
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable full-screen mode:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit full-screen mode:', err);
      });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      {/* <div className="h-12 bg-background border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/workspace/${projectId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h1 className="font-semibold text-lg text-foreground">Document Editor</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDocumentPanel(!showDocumentPanel)}
            className="gap-2"
          >
            <PanelLeftOpen className="w-4 h-4" />
            {showDocumentPanel ? 'Hide' : 'Show'} Files
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${projectId}/split?left=${documentId}&leftType=document`)}
            className="gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Split View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullScreen}
            className="gap-2"
          >
            {isFullScreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            {isFullScreen ? 'Exit' : 'Full Screen'}
          </Button>
        </div>
      </div> */}

      {/* Main Content Area with Resizable Panels */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Documentation Panel - Only show when toggled and not mobile */}
          {showDocumentPanel && !isMobile && (
            <>
              <ResizablePanel
                defaultSize={25}
                minSize={15}
                maxSize={50}
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
          )}

          {/* Document Editor */}
          <ResizablePanel
            defaultSize={showDocumentPanel && !isMobile ? 75 : 100}
            minSize={50}
            className="overflow-hidden"
          >
            <LazyPlateEditor
              documentId={documentId}
              projectId={projectId}
              projectName={projectName}
              isReadOnly={isReadOnly}
              className="h-full"
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
