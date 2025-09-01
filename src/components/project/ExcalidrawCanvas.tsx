'use client';
import { useCallback, useRef, useEffect } from "react";
import {
  Excalidraw,
  WelcomeScreen,
  Sidebar,
} from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  AppState,
  BinaryFiles,
  LibraryItems
} from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import "@excalidraw/excalidraw/index.css";
import "../../styles/excalidraw-custom.css";
import { CanvasProvider, useCanvas } from '@/contexts/CanvasContext';
import { CanvasWelcomeScreen } from '@/components/canvas';
import { ExcalidrawLibrarySystem } from '@/components/canvas';
import { useTheme } from 'next-themes';

interface ExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  canvasId?: string;
  isReadOnly?: boolean;
  shareToken?: string; // For public access
}

function ExcalidrawCanvasContent({
  projectName,
  isReadOnly = false,
  shareToken
}: ExcalidrawCanvasProps) {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const { theme } = useTheme();

  const {
    elements,
    appState,
    files,
    saving,
    updateElements,
    updateAppState,
    updateFiles,
    isLoading
  } = useCanvas();

  // Handle custom events from navigation
  useEffect(() => {
    const handleFitToContent = () => {
      if (excalidrawAPIRef.current) {
        excalidrawAPIRef.current.scrollToContent();
      }
    };

    window.addEventListener('canvas-fit-to-content', handleFitToContent);

    return () => {
      window.removeEventListener('canvas-fit-to-content', handleFitToContent);
    };
  }, []);

  // Handle changes from Excalidraw
  const handleChange = useCallback((
    newElements: readonly ExcalidrawElement[],
    newAppState: AppState,
    newFiles: BinaryFiles
  ) => {
    // Don't update if in read-only mode or public mode
    if (isReadOnly || shareToken) return;

    // Only update if there are actual changes to prevent infinite loops
    if (JSON.stringify(newElements) !== JSON.stringify(elements)) {
      updateElements(newElements);
    }

    // Update app state (excluding collaborators to prevent loops)
    const { collaborators, ...restAppState } = newAppState;
    if (JSON.stringify(restAppState) !== JSON.stringify({ ...appState, collaborators: undefined })) {
      updateAppState(restAppState);
    }

    // Update files
    if (JSON.stringify(newFiles) !== JSON.stringify(files)) {
      updateFiles(newFiles);
    }
  }, [elements, appState, files, updateElements, updateAppState, updateFiles, isReadOnly, shareToken]);

  // Handle library items
  const handleLibraryChange = useCallback((_libraryItems: LibraryItems) => {
    // Handle library changes if needed
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20">
        <div className="text-center space-y-6 p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mx-auto"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-2 border-primary/10 mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Loading Canvas</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Preparing your creative workspace...
            </p>
          </div>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
      <Excalidraw
        ref={excalidrawAPIRef}
        initialData={{
          elements: elements || [],
          appState: {
            ...appState,
            collaborators: new Map(),
          },
          files: files || {},
        }}
        onChange={handleChange}
        onLibraryChange={handleLibraryChange}
        viewModeEnabled={isReadOnly || !!shareToken}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme={theme === 'dark' ? 'dark' : 'light'}
        name={projectName}
        UIOptions={{
          canvasActions: {
            loadScene: (!isReadOnly && !shareToken) ? {} : false,
            saveScene: (!isReadOnly && !shareToken) ? {} : false,
            export: {},
            saveAsImage: {},
          },
        }}
      >


        <WelcomeScreen>
          <CanvasWelcomeScreen projectName={projectName} />
        </WelcomeScreen>

        {!isReadOnly && !shareToken && (
          <Sidebar name="library" tab="library">
            <div className="p-4 space-y-4">
              <ExcalidrawLibrarySystem excalidrawAPI={excalidrawAPIRef.current} />
            </div>
          </Sidebar>
        )}
      </Excalidraw>

      {/* Saving indicator */}
      {saving && !isReadOnly && !shareToken && (
        <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          Saving...
        </div>
      )}

      {/* Read-only indicator */}
      {(isReadOnly || shareToken) && (
        <div className="absolute top-4 right-4 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
          {shareToken ? 'Public View' : 'Read Only'}
        </div>
      )}
    </div>
  );
}

export function ExcalidrawCanvas(props: ExcalidrawCanvasProps) {
  return (
    <CanvasProvider
      projectId={props.projectId}
      canvasId={props.canvasId}
      shareToken={props.shareToken}
    >
      <ExcalidrawCanvasContent {...props} />
    </CanvasProvider>
  );
}