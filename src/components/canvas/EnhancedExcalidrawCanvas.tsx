"use client";

import React, { memo } from 'react';
import { ExcalidrawCanvas } from '@/components/project/ExcalidrawCanvas';
import { ShapeConnector } from './ShapeConnector';
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext';

interface EnhancedExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  canvasId?: string;
  isReadOnly?: boolean;
}

// Content component that uses the canvas context
const EnhancedExcalidrawCanvasContent = memo(function EnhancedExcalidrawCanvasContent(
  props: EnhancedExcalidrawCanvasProps
) {
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
});

// Main component that provides the canvas context
export const EnhancedExcalidrawCanvas = memo(function EnhancedExcalidrawCanvas(
  props: EnhancedExcalidrawCanvasProps
) {
  return (
    <CanvasProvider projectId={props.projectId} canvasId={props.canvasId}>
      <EnhancedExcalidrawCanvasContent {...props} />
    </CanvasProvider>
  );
});