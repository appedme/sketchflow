"use client";

import React from 'react';
import { ExcalidrawCanvas } from '@/components/project/ExcalidrawCanvas';
import { ShapeConnector } from './ShapeConnector';
import { useCanvas } from '@/contexts/CanvasContext';

interface EnhancedExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  canvasId?: string;
  isReadOnly?: boolean;
}

function EnhancedExcalidrawCanvasContent(props: EnhancedExcalidrawCanvasProps) {
  const { elements, updateElements } = useCanvas();
  const [excalidrawAPI, setExcalidrawAPI] = React.useState<any>(null);

  // Show welcome screen when canvas is empty
  const showWelcomeScreen = elements.length === 0;

  return (
    <div className="w-full h-full relative">
      {/* Original Excalidraw Canvas */}
      <div className="w-full h-full">
        <ExcalidrawCanvas {...props} />
      </div>

      {/* Shape Connector Overlay */}
      {!props.isReadOnly && !showWelcomeScreen && (
        <ShapeConnector
          excalidrawAPI={excalidrawAPI}
          elements={elements}
          onElementsChange={updateElements}
        />
      )}
    </div>
  );
}

export function EnhancedExcalidrawCanvas(props: EnhancedExcalidrawCanvasProps) {
  return <EnhancedExcalidrawCanvasContent {...props} />;
}