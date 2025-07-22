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
    <div className="h-full flex flex-col bg-background">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
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