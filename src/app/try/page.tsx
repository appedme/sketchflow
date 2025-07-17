"use client";

import React, { useCallback, useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { Smile } from 'lucide-react';
import "@excalidraw/excalidraw/index.css";
// Create the main component that will render Excalidraw
function ExcalidrawWrapper() {
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

  // Add OpenMoji image to canvas
  const addOpenMojiImage = useCallback(async () => {
    if (!excalidrawAPIRef.current) {
      console.error('Excalidraw API not available');
      return;
    }

    try {
      console.log('Adding emoji image...');

      // Create a canvas-based emoji
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }
      
      canvas.width = 128;
      canvas.height = 128;
      
      // Draw a grinning face emoji
      ctx.fillStyle = '#FFD700'; // Gold background
      ctx.beginPath();
      ctx.arc(64, 64, 56, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add border
      ctx.strokeStyle = '#FFA500';
      ctx.lineWidth = 4;
      ctx.stroke();
      
      // Eyes
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(45, 50, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(83, 50, 6, 0, 2 * Math.PI);
      ctx.fill();
      
      // Smile
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(64, 64, 25, 0.3 * Math.PI, 0.7 * Math.PI);
      ctx.stroke();
      
      // Teeth
      ctx.fillStyle = '#FFF';
      ctx.fillRect(48, 75, 32, 8);
      
      // Tooth separators
      ctx.strokeStyle = '#DDD';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const x = 48 + (i * 32 / 4);
        ctx.beginPath();
        ctx.moveTo(x, 75);
        ctx.lineTo(x, 83);
        ctx.stroke();
      }
      
      const imageDataUrl = canvas.toDataURL('image/png');
      console.log('Created canvas emoji, data URL length:', imageDataUrl.length);

      // Get center position
      const appState = excalidrawAPIRef.current.getAppState();
      const centerX = (appState.scrollX || 0) + (appState.width || 800) / 2;
      const centerY = (appState.scrollY || 0) + (appState.height || 600) / 2;

      // Create file ID
      const fileId = `emoji-${Date.now()}`;
      
      // Create the BinaryFileData object
      const fileData = {
        id: fileId,
        dataURL: imageDataUrl,
        mimeType: 'image/png' as const,
        created: Date.now(),
        lastRetrieved: Date.now(),
      };

      // Get current scene data
      const currentElements = excalidrawAPIRef.current.getSceneElements();
      const currentFiles = excalidrawAPIRef.current.getFiles();

      // Create image element with minimal required properties
      const imageElement = {
        type: 'image',
        id: `image-${Date.now()}`,
        x: centerX - 64,
        y: centerY - 64,
        width: 128,
        height: 128,
        angle: 0,
        strokeColor: 'transparent',
        backgroundColor: 'transparent',
        fillStyle: 'solid',
        strokeWidth: 0,
        strokeStyle: 'solid',
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: Math.floor(Math.random() * 2147483647),
        versionNonce: Math.floor(Math.random() * 2147483647),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        fileId: fileId,
        status: 'saved',
        scale: [1, 1],
      };

      // First add the file to Excalidraw's files state
      const newFiles: BinaryFiles = {
        ...currentFiles,
        [fileId]: fileData as any,
      };

      // Update files first
      setFiles(newFiles);

      // Then update scene with new element
      excalidrawAPIRef.current.updateScene({
        elements: [...currentElements, imageElement as any],
      });

      console.log('Successfully added emoji image!');

    } catch (error) {
      console.error('Error adding emoji:', error);
      alert(`Unable to add emoji image. Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThe drawing tools should still work fine!`);
    }
  }, []);

  // Load Excalidraw components dynamically
  const [excalidrawComponents, setExcalidrawComponents] = useState<any>(null);

  useEffect(() => {
    import("@excalidraw/excalidraw").then((mod) => {
      setExcalidrawComponents(mod);
    });
  }, []);

  if (!excalidrawComponents) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😀</div>
          <h1 className="text-2xl font-bold mb-2">Loading Excalidraw...</h1>
          <p className="text-gray-600">Please wait while the drawing canvas loads</p>
        </div>
      </div>
    );
  }

  const { Excalidraw, MainMenu, WelcomeScreen } = excalidrawComponents;

  // Show welcome screen when canvas is empty
  const showWelcomeScreen = elements.length === 0;

  return (
    <div className="w-full h-screen relative bg-white">
      <Excalidraw
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => {
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
            <MainMenu.Item onSelect={addOpenMojiImage}>
              Add Grinning Face Emoji
            </MainMenu.Item>
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group title="Instructions">
            <MainMenu.Item onSelect={() => alert('Click "Add Grinning Face Emoji" to add an emoji to the canvas!')}>
              How to use
            </MainMenu.Item>
          </MainMenu.Group>
        </MainMenu>

        <WelcomeScreen>
          <WelcomeScreen.Center>
            <div className="text-center">
              <div className="text-6xl mb-4">😀</div>
              <h1 className="text-2xl font-bold mb-2">Try Excalidraw</h1>
              <p className="text-gray-600 mb-4">
                Test adding canvas-based emoji images
              </p>
              <div className="text-sm text-gray-500">
                <p>Draw shapes and add emojis</p>
                <p>Click the menu or button to add a grinning face</p>
                <p>Experiment with the canvas</p>
              </div>
            </div>
          </WelcomeScreen.Center>
        </WelcomeScreen>
      </Excalidraw>

      {/* Floating Add Button */}
      <button
        onClick={addOpenMojiImage}
        className="fixed top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-200 hover:scale-105 z-50"
      >
        <Smile className="w-5 h-5" />
        Add Grinning Face
      </button>

      {/* Instructions overlay */}
      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-sm border">
        <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
          Try Excalidraw
        </h3>
        <div className="text-xs space-y-1 text-gray-600">
          <p>• Click the blue button to add a canvas-generated emoji</p>
          <p>• Use the toolbar to draw shapes</p>
          <p>• The emoji will appear at the center of your view</p>
        </div>
        <div className="mt-3 pt-2 border-t text-xs text-gray-500">
          <p>Custom canvas-based emoji rendering</p>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-4 right-4 bg-black/80 text-white text-xs p-3 rounded-lg">
        <div>Total Elements: {elements.length}</div>
        <div>Images: {elements.filter(el => el.type === 'image').length}</div>
        <div>Files: {Object.keys(files).length}</div>
      </div>
    </div>
  );
}

// Dynamically import the wrapper to avoid SSR issues
const ExcalidrawPage = dynamic(() => Promise.resolve(ExcalidrawWrapper), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-6xl mb-4">😀</div>
        <h1 className="text-2xl font-bold mb-2">Loading Excalidraw...</h1>
        <p className="text-gray-600">Please wait while the drawing canvas loads</p>
      </div>
    </div>
  )
});

export default function TryPage() {
  return <ExcalidrawPage />;
}