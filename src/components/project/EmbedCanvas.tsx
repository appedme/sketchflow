"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import components to avoid SSR issues
const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then(mod => mod.ExcalidrawCanvas),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }
);

interface EmbedCanvasProps {
  projectId: string;
  projectName: string;
  showToolbar: boolean;
  allowEdit: boolean;
}

export function EmbedCanvas({ projectId, projectName, showToolbar, allowEdit }: EmbedCanvasProps) {
  return (
    <div className="h-screen w-full flex flex-col bg-white">
      {/* Optional Toolbar */}
      {showToolbar && (
        <div className="h-12 bg-gray-50 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-medium text-gray-900 text-sm">{projectName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {allowEdit ? 'Interactive' : 'View Only'}
            </span>
            <a
              href={`/project/${projectId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Open Full View
            </a>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading canvas...</p>
            </div>
          </div>
        }>
          <ExcalidrawCanvas
            projectId={projectId}
            projectName={projectName}
            isReadOnly={!allowEdit}
          />
        </Suspense>
      </div>

      {/* Optional Footer */}
      {showToolbar && (
        <div className="h-8 bg-gray-50 border-t border-gray-200 flex items-center justify-center flex-shrink-0">
          <a
            href="https://sketchflow.space"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Powered by SketchFlow
          </a>
        </div>
      )}
    </div>
  );
}