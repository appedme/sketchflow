"use client";

import dynamic from 'next/dynamic';

const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then(mod => mod.ExcalidrawCanvas),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-full">Loading canvas...</div>
  }
);

interface PublicCanvasViewerProps {
  canvasId: string;
  projectId: string;
  projectName: string;
}

export function PublicCanvasViewer({ 
  canvasId, 
  projectId, 
  projectName 
}: PublicCanvasViewerProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg text-gray-900">{projectName}</h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Public Canvas
          </span>
        </div>
      </div>
      <div className="flex-1">
        <ExcalidrawCanvas
          projectId={projectId}
          canvasId={canvasId}
          projectName={projectName}
          isReadOnly={true}
        />
      </div>
    </div>
  );
}