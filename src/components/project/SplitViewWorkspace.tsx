"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { DocumentationPanel } from './DocumentationPanel';
import { SplitViewDocumentEditor } from './SplitViewDocumentEditor';
import dynamic from 'next/dynamic';

const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then((mod) => ({ default: mod.ExcalidrawCanvas })),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center">Loading canvas...</div>
  }
);

interface SplitViewWorkspaceProps {
  projectId: string;
  projectName: string;
  leftItemId?: string;
  leftItemType?: 'document' | 'canvas';
  rightItemId?: string;
  rightItemType?: 'document' | 'canvas';
}

export function SplitViewWorkspace({
  projectId,
  projectName,
  leftItemId,
  leftItemType = 'document',
  rightItemId,
  rightItemType = 'canvas',
}: SplitViewWorkspaceProps) {
  const router = useRouter();
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);
  
  // Storage key for persisting panel sizes
  const storageKey = `split-view-${projectId}-${leftItemId}-${rightItemId}`;
  
  // Load saved panel sizes from localStorage
  const [leftPanelSize, setLeftPanelSize] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved).leftSize : 50;
    }
    return 50;
  });

  // Save panel sizes to localStorage
  const handlePanelResize = (sizes: number[]) => {
    const [leftSize, rightSize] = sizes;
    setLeftPanelSize(leftSize);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, JSON.stringify({
        leftSize,
        rightSize,
        timestamp: Date.now()
      }));
    }
  };

  // Handle expand/collapse functionality
  const handleLeftExpand = () => {
    setLeftExpanded(!leftExpanded);
    setRightExpanded(false);
  };

  const handleRightExpand = () => {
    setRightExpanded(!rightExpanded);
    setLeftExpanded(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg text-gray-900">{projectName} - Split View</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLeftExpand}
            disabled={rightExpanded}
          >
            {leftExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {leftItemType === 'document' ? 'Document' : 'Canvas'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRightExpand}
            disabled={leftExpanded}
          >
            {rightExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {rightItemType === 'document' ? 'Document' : 'Canvas'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/project/${projectId}`)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Split Content */}
      <div className="flex-1 overflow-hidden">
        {leftExpanded || rightExpanded ? (
          // Full screen mode - show only one panel
          <div className="h-full bg-white">
            {leftExpanded ? (
              leftItemType === 'document' ? (
                <SplitViewDocumentEditor documentId={leftItemId || projectId} />
              ) : (
                <ExcalidrawCanvas
                  projectId={leftItemId || projectId}
                  projectName={`${projectName} - Left Canvas`}
                />
              )
            ) : (
              rightItemType === 'canvas' ? (
                <ExcalidrawCanvas
                  projectId={rightItemId || projectId}
                  projectName={`${projectName} - Right Canvas`}
                />
              ) : (
                <SplitViewDocumentEditor documentId={rightItemId || projectId} />
              )
            )}
          </div>
        ) : (
          // Split view mode - resizable panels
          <ResizablePanelGroup
            direction="horizontal"
            className="h-full"
            onLayout={handlePanelResize}
          >
            {/* Left Panel */}
            <ResizablePanel 
              defaultSize={leftPanelSize}
              minSize={20}
              maxSize={80}
              className="bg-white overflow-hidden"
            >
              {leftItemType === 'document' ? (
                <SplitViewDocumentEditor documentId={leftItemId || projectId} />
              ) : (
                <ExcalidrawCanvas
                  projectId={leftItemId || projectId}
                  projectName={`${projectName} - Left Canvas`}
                />
              )}
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle withHandle />

            {/* Right Panel */}
            <ResizablePanel 
              defaultSize={100 - leftPanelSize}
              minSize={20}
              maxSize={80}
              className="bg-white overflow-hidden"
            >
              {rightItemType === 'canvas' ? (
                <ExcalidrawCanvas
                  projectId={rightItemId || projectId}
                  projectName={`${projectName} - Right Canvas`}
                />
              ) : (
                <SplitViewDocumentEditor documentId={rightItemId || projectId} />
              )}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </div>
  );
}