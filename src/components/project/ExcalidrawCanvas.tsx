'use client';
import { useCallback, useRef, useEffect } from "react";
import { 
  Excalidraw, 
  MainMenu, 
  WelcomeScreen, 
  Sidebar,
  convertToExcalidrawElements,
  serializeAsJSON,
  loadSceneOrLibraryFromBlob,
  exportToCanvas,
  exportToSvg,
  exportToBlob
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

interface ExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  canvasId?: string;
  isReadOnly?: boolean;
}

function ExcalidrawCanvasContent({ 
  projectId, 
  projectName,
  canvasId,
  isReadOnly = false
}: ExcalidrawCanvasProps) {
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneFileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    elements,
    appState,
    files,
    saving,
    updateElements,
    updateAppState,
    updateFiles,
    saveCanvas,
    isLoading
  } = useCanvas();

  // Handle changes from Excalidraw
  const handleChange = useCallback((
    newElements: readonly ExcalidrawElement[],
    newAppState: AppState,
    newFiles: BinaryFiles
  ) => {
    // Only update if there are actual changes to prevent infinite loops
    if (JSON.stringify(newElements) !== JSON.stringify(elements)) {
      updateElements(newElements);
    }
    
    // Update app state (excluding volatile properties like collaborators)
    const { collaborators, ...stableAppState } = newAppState;
    const currentAppStateWithoutCollaborators = { ...appState };
    delete currentAppStateWithoutCollaborators.collaborators;
    
    if (JSON.stringify(stableAppState) !== JSON.stringify(currentAppStateWithoutCollaborators)) {
      updateAppState({
        ...stableAppState,
        collaborators: new Map(), // Always ensure collaborators is a Map
      });
    }
    
    // Update files if changed
    if (JSON.stringify(newFiles) !== JSON.stringify(files)) {
      updateFiles(newFiles);
    }
  }, [elements, appState, files, updateElements, updateAppState, updateFiles]);

  // Export functions
  const exportToPNG = useCallback(async () => {
    if (!excalidrawAPIRef.current) return;
    
    try {
      const canvas = await exportToCanvas({
        elements,
        appState,
        files,
        getDimensions: () => ({ width: 1920, height: 1080 })
      });
      
      const link = document.createElement('a');
      link.download = `${projectName}-canvas.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Export to PNG failed:', error);
    }
  }, [elements, appState, files, projectName]);

  const exportToSVGFile = useCallback(async () => {
    if (!excalidrawAPIRef.current) return;
    
    try {
      const svg = await exportToSvg({
        elements,
        appState,
        files,
      });
      
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${projectName}-canvas.svg`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export to SVG failed:', error);
    }
  }, [elements, appState, files, projectName]);

  const exportToJSON = useCallback(() => {
    try {
      const data = serializeAsJSON(elements, appState, files, 'local');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `${projectName}-canvas.excalidraw`;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export to JSON failed:', error);
    }
  }, [elements, appState, files, projectName]);

  // Import functions
  const importFromJSON = useCallback(() => {
    if (sceneFileInputRef.current) {
      sceneFileInputRef.current.click();
    }
  }, []);

  const handleSceneFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await loadSceneOrLibraryFromBlob(file, null, elements);
      if (result.type === 'scene') {
        updateElements(result.data.elements);
        updateAppState({ ...appState, ...result.data.appState });
        if (result.data.files) {
          updateFiles(result.data.files);
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
    
    // Reset file input
    event.target.value = '';
  }, [elements, appState, updateElements, updateAppState, updateFiles]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveCanvas();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [saveCanvas]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {saving && (
        <div className="absolute top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Saving...</span>
        </div>
      )}
      
      <Excalidraw
        ref={(api) => {
          excalidrawAPIRef.current = api;
        }}
        initialData={{
          elements,
          appState: {
            ...appState,
            collaborators: new Map(),
            name: projectName,
            viewModeEnabled: isReadOnly,
          },
          files,
          libraryItems: [],
        }}
        onChange={handleChange}
        viewModeEnabled={isReadOnly}
        zenModeEnabled={false}
        gridModeEnabled={false}
        theme="light"
        name={projectName}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            export: {
              saveFileToDisk: false,
            },
            theme: false,
          },
        }}
      >
        <MainMenu>
          <MainMenu.Group title="Export">
            <MainMenu.Item onSelect={exportToPNG}>
              Export to PNG
            </MainMenu.Item>
            <MainMenu.Item onSelect={exportToSVGFile}>
              Export to SVG
            </MainMenu.Item>
            <MainMenu.Item onSelect={exportToJSON}>
              Export to Excalidraw
            </MainMenu.Item>
          </MainMenu.Group>
          <MainMenu.Group title="Import">
            <MainMenu.Item onSelect={importFromJSON}>
              Import Excalidraw file
            </MainMenu.Item>
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group title="Canvas">
            <MainMenu.Item onSelect={saveCanvas}>
              Save Canvas (Ctrl+S)
            </MainMenu.Item>
          </MainMenu.Group>
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Hints.MenuHint />
          <WelcomeScreen.Hints.ToolbarHint />
        </WelcomeScreen>
      </Excalidraw>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        ref={sceneFileInputRef}
        type="file"
        accept=".excalidraw,.json"
        onChange={handleSceneFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}

export function ExcalidrawCanvas(props: ExcalidrawCanvasProps) {
  return (
    <CanvasProvider projectId={props.projectId} canvasId={props.canvasId}>
      <ExcalidrawCanvasContent {...props} />
    </CanvasProvider>
  );
}