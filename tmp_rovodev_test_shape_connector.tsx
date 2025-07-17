"use client";

import React, { useState, useRef } from 'react';
import { ShapeConnector } from './src/components/canvas/ShapeConnector';

// Test component to verify ShapeConnector functionality
export function TestShapeConnector() {
  const [elements, setElements] = useState([
    {
      type: 'rectangle',
      id: 'test-rect-1',
      x: 100,
      y: 100,
      width: 100,
      height: 80,
      angle: 0,
      strokeColor: '#000000',
      backgroundColor: '#ffffff',
      fillStyle: 'solid',
      strokeWidth: 2,
      strokeStyle: 'solid',
      roughness: 1,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: 12345,
      versionNonce: 67890,
      isDeleted: false,
      boundElements: null,
      updated: 1,
      link: null,
      locked: false,
    }
  ]);

  const mockAPI = {
    getAppState: () => ({
      zoom: { value: 1 },
      scrollX: 0,
      scrollY: 0,
      width: 800,
      height: 600,
    }),
    getSceneElements: () => elements,
    getFiles: () => ({}),
    updateScene: ({ elements: newElements }) => {
      setElements(newElements);
    },
  };

  return (
    <div className="w-full h-screen bg-gray-100 relative">
      <h1 className="absolute top-4 left-4 text-xl font-bold z-50">
        Shape Connector Test - Hover over rectangle edges
      </h1>
      
      {/* Render test rectangle */}
      <div 
        className="absolute bg-white border-2 border-black"
        style={{
          left: 100,
          top: 100,
          width: 100,
          height: 80,
        }}
      />
      
      <ShapeConnector
        excalidrawAPI={mockAPI}
        elements={elements}
        onElementsChange={setElements}
      />
    </div>
  );
}