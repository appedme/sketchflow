"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, PanelLeftOpen, SplitSquareHorizontal, FileText } from 'lucide-react';
import { PlateDocumentEditor } from './PlateDocumentEditor';
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

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="h-14 bg-background/95 backdrop-blur-sm border-b flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/project/${projectId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Mobile Documentation Panel Trigger */}
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
              className="gap-2 hover:bg-accent"
            >
              <PanelLeftOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Docs</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">Document Editor</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">{projectName}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${projectId}/split?left=${documentId}&leftType=document&right=${projectId}&rightType=canvas`)}
            className="gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Split View</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Documentation Panel */}
        {!isMobile && showDocumentPanel && (
          <div className="w-96 bg-background border-r shadow-xl z-20 animate-slide-in-left">
            <DocumentationPanel
              projectId={projectId}
              projectName={projectName}
              className="border-0 shadow-none"
            />
          </div>
        )}

        {/* Document Editor */}
        <div className="flex-1 overflow-hidden">
          <PlateDocumentEditor
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
