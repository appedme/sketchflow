"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SplitSquareHorizontal } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Excalidraw to avoid SSR issues
const ExcalidrawCanvas = dynamic(
  () => import('./ExcalidrawCanvas').then(mod => mod.ExcalidrawCanvas),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center">Loading canvas...</div>
  }
);

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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Full Screen Header for Canvas */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/project/${projectId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="font-semibold text-lg text-gray-900">Canvas - Full Screen</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${projectId}/split?left=${canvasId}&leftType=canvas&right=${projectId}&rightType=canvas`)}
            className="gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Split View
          </Button>
        </div>
      </div>

      {/* Full Screen Canvas Content */}
      <div className="flex-1">
        <ExcalidrawCanvas
          projectId={canvasId}
          projectName={projectName}
          isReadOnly={false}
        />
      </div>
    </div>
  );
}