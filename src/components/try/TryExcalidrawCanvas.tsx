"use client";

import React, { useCallback, useRef, useState } from "react";
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
} from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import { ShapeConnector } from '@/components/canvas/ShapeConnector';

export function TryExcalidrawCanvas() {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<Partial<AppState>>({});
  const [files, setFiles] = useState<BinaryFiles>({});

  // Handle changes from Excalidraw
  const handleChange = useCallback((
    newElements: readonly ExcalidrawElement[],
    newAppState: AppState,
    newFiles: BinaryFiles
  ) => {
    setElements(newElements);
    setAppState(newAppState);
    setFiles(newFiles);
  }, []);

  // Handle elements change from ShapeConnector
  const handleElementsChange = useCallback((newElements: readonly ExcalidrawElement[]) => {
    setElements(newElements);
    
    // Update Excalidraw with new elements
    if (excalidrawAPIRef.current) {
      excalidrawAPIRef.current.updateScene({
        elements: newElements,
      });
    }
  }, []);

  // Show welcome screen when canvas is empty
  const showWelcomeScreen = elements.length === 0;

  return (
    <div className="w-full h-screen relative bg-white">
      <Excalidraw
        excalidrawAPI={(api) => {
          excalidrawAPIRef.current = api;
        }}
        initialData={{
          elements: [],
          appState: {
            viewModeEnabled: false,
            zenModeEnabled: false,
            gridModeEnabled: false,
          },
          files: {},
          libraryItems: [],
        }}
        onChange={handleChange}
        viewModeEnabled={false}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
        name="Try Excalidraw"
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: {
              saveFileToDisk: true,
            },
          },
        }}
      >
        <MainMenu>
          <MainMenu.Group title="Try Mode">
            <MainMenu.Item onSelect={() => console.log('Try mode active!')}>
              🎨 Try Mode Active
            </MainMenu.Item>
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group title="Instructions">
            <MainMenu.Item onSelect={() => alert('1. Draw a rectangle\n2. Hover over its edges\n3. Click the + icon to add connected shapes!')}>
              📖 How to use Shape Connector
            </MainMenu.Item>
          </MainMenu.Group>
        </MainMenu>

        <WelcomeScreen>
          <WelcomeScreen.Center>
            <div className="text-center">
              <div className="text-6xl mb-4">🎨</div>
              <h1 className="text-2xl font-bold mb-2">Try Excalidraw with Shape Connector</h1>
              <p className="text-gray-600 mb-4">
                Draw shapes and hover over their edges to see the magic!
              </p>
              <div className="text-sm text-gray-500">
                <p>✨ Hover over rectangle edges to see + icons</p>
                <p>🔗 Click + to create connected shapes</p>
                <p>🎯 Perfect for flowcharts and diagrams</p>
              </div>
            </div>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>

      {/* Shape Connector for hover-to-add feature */}
      {!showWelcomeScreen && (
        <ShapeConnector
          excalidrawAPI={excalidrawAPIRef.current}
          elements={elements}
          onElementsChange={handleElementsChange}
        />
      )}

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm">
        <h3 className="font-semibold text-sm mb-2">🚀 Shape Connector Demo</h3>
        <ol className="text-xs space-y-1 text-gray-600">
          <li>1. Draw a rectangle using the toolbar</li>
          <li>2. Hover over the edges of the rectangle</li>
          <li>3. Click the blue + icon that appears</li>
          <li>4. Watch new connected shapes appear!</li>
        </ol>
      </div>

      {/* Debug info */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded">
        Elements: {elements.length} | Shapes: {elements.filter(el => ['rectangle', 'ellipse', 'diamond'].includes(el.type)).length}
      </div>
    </div>
  );
}