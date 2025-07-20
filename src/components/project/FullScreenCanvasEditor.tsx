"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, SplitSquareHorizontal, Save } from 'lucide-react';
import dynamic from 'next/dynamic';
import { DocumentationPanel } from './DocumentationPanel';

// Use optimized lazy loading for better performance
import { LazyExcalidrawCanvas } from '@/components/optimized/LazyExcalidrawCanvas';

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
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [saving, setSaving] = useState(false);

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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Full Screen Header for Canvas */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDocumentPanel(!showDocumentPanel)}
            className="gap-2"
          >
            <PanelLeftOpen className="w-4 h-4" />
            Docs
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
          <Button 
            size="sm" 
            className="gap-2" 
            onClick={handleSave} 
            disabled={saving}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Documentation Panel */}
        {showDocumentPanel && (
          <div className="w-1/3 bg-white border-r border-gray-200 shadow-lg z-20 flex flex-col overflow-hidden">
            <DocumentationPanel
              projectId={projectId}
              projectName={projectName}
            />
          </div>
        )}
        
        {/* Full Screen Canvas Content */}
        <div className="flex-1">
          <LazyExcalidrawCanvas
            projectId={projectId}
            canvasId={canvasId}
            projectName={projectName}
            isReadOnly={false}
          />
        </div>
      </div>
    </div>
  );
}