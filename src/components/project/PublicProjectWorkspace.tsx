"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye } from 'lucide-react';
import dynamic from 'next/dynamic';

const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then(mod => mod.ExcalidrawCanvas),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading canvas...</div>
  }
);

interface PublicProjectWorkspaceProps {
  projectId: string;
  projectName: string;
  shareData?: any;
}

export function PublicProjectWorkspace({
  projectId,
  projectName,
  shareData
}: PublicProjectWorkspaceProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Public Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Eye className="w-4 h-4 text-gray-500" />
          <h1 className="font-semibold text-lg text-gray-900">{projectName}</h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Public View
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://sketchflow.space', '_blank')}
            className="gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Create Your Own
          </Button>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="flex-1">
        <ExcalidrawCanvas
          projectId={projectId}
          projectName={projectName}
          isReadOnly={true}
        />
      </div>
    </div>
  );
}