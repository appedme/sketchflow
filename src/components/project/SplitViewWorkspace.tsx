"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2 } from 'lucide-react';
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
  onClose: () => void;
}

export function SplitViewWorkspace({
  projectId,
  projectName,
  leftItemId,
  leftItemType = 'document',
  rightItemId,
  rightItemType = 'canvas',
  onClose
}: SplitViewWorkspaceProps) {
  const [leftExpanded, setLeftExpanded] = useState(false);
  const [rightExpanded, setRightExpanded] = useState(false);

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
            onClick={() => setLeftExpanded(!leftExpanded)}
            disabled={rightExpanded}
          >
            {leftExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {leftItemType === 'document' ? 'Document' : 'Canvas'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightExpanded(!rightExpanded)}
            disabled={leftExpanded}
          >
            {rightExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            {rightItemType === 'document' ? 'Document' : 'Canvas'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Split Content */}
      <div className="flex-1 flex">
        {/* Left Panel */}
        <div className={`${
          leftExpanded ? 'w-full' : rightExpanded ? 'w-0' : 'w-1/2'
        } transition-all duration-300 border-r border-gray-200 bg-white overflow-hidden`}>
          {leftItemType === 'document' ? (
            <SplitViewDocumentEditor documentId={leftItemId || projectId} />
          ) : (
            <ExcalidrawCanvas
              projectId={leftItemId || projectId}
              projectName={`${projectName} - Left Canvas`}
            />
          )}
        </div>

        {/* Right Panel */}
        <div className={`${
          rightExpanded ? 'w-full' : leftExpanded ? 'w-0' : 'w-1/2'
        } transition-all duration-300 bg-white overflow-hidden`}>
          {rightItemType === 'canvas' ? (
            <ExcalidrawCanvas
              projectId={rightItemId || projectId}
              projectName={`${projectName} - Right Canvas`}
            />
          ) : (
            <SplitViewDocumentEditor documentId={rightItemId || projectId} />
          )}
        </div>
      </div>
    </div>
  );
}