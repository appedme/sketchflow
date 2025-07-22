"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, PanelLeftOpen, SplitSquareHorizontal, FileText, Maximize, Minimize } from 'lucide-react';
import { LazyPlateEditor } from '@/components/optimized/LazyPlateEditor';
import { DocumentationPanel } from './DocumentationPanel';

interface FullScreenDocumentEditorProps {
  projectId: string;
  documentId: string;
  projectName: string;
}

export function FullScreenDocumentEditor({
  projectId,
  documentId,
  projectName,
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
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document Editor */}
        <div className="flex-1 overflow-hidden">
          <LazyPlateEditor
            documentId={documentId}
            projectId={projectId}
            projectName={projectName}
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
