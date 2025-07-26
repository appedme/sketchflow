"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PanelLeftOpen, SplitSquareHorizontal, Save, ArrowLeft, Maximize, Minimize, PencilRuler } from 'lucide-react';
import dynamic from 'next/dynamic';
import { DocumentationPanel } from './DocumentationPanel';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

// Use optimized lazy loading for better performance
import { LazyExcalidrawCanvas } from '@/components/optimized/LazyExcalidrawCanvas';
import { useApi } from '@/hooks/useApi';

interface FullScreenCanvasEditorProps {
  projectId: string;
  canvasId: string;
  projectName: string;
}

export function FullScreenCanvasEditor({
  projectId,
  canvasId,
  projectName,
}: FullScreenCanvasEditorProps) {
  const router = useRouter();

  // Fetch canvas data to get title
  const { data: canvas } = useApi(`/api/canvas/${canvasId}`);

  // Set document title
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [saving, setSaving] = useState(false);
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

  return (
    <div className="h-full flex flex-col bg-background">
      

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

          {/* Canvas Editor */}
          <ResizablePanel
            defaultSize={showDocumentPanel && !isMobile ? 75 : 100}
            minSize={50}
            className="overflow-hidden"
          >
            <LazyExcalidrawCanvas
              projectId={projectId}
              canvasId={canvasId}
              projectName={projectName}
              isReadOnly={false}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}