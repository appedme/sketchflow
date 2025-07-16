'use client';
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
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
import { uploadImageFromDataURL } from '@/lib/imageUpload';
import { LibraryPanel } from '@/components/canvas/LibraryPanel';
import type { LibraryItem } from '@/lib/excalidraw-libraries';
import { CanvasWelcomeScreen } from '@/components/canvas/CanvasWelcomeScreen';
import { OpenMojiSidebar } from '@/components/canvas/OpenMojiSidebar';
import { OpenMojiService, OpenMojiIcon } from '@/lib/services/openmoji';
import Image from "next/image";

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

  // OpenMoji sidebar state
  const [isOpenMojiSidebarOpen, setIsOpenMojiSidebarOpen] = useState(false);
  const openMojiService = useMemo(() => OpenMojiService.getInstance(), []);

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

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File): Promise<{ url: string; id: string; dataURL: string }> => {
    try {
      // Convert file to data URL first
      const dataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Upload to FreeImage.host
      const result = await uploadImageFromDataURL(dataURL, file.name);
      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      if (result.success && result.url) {
        console.log('Image uploaded successfully:', result.url);

        // Add to Excalidraw files
        const newFiles = {
          ...files,
          [id]: {
            mimeType: file.type as any,
            id: id,
            dataURL: result.url,
            created: Date.now(),
          }
        };
        updateFiles(newFiles as any);

        return {
          url: result.url,
          id: id,
          dataURL: result.url
        };
      } else {
        console.warn('Image upload failed, using local data URL:', result.error);

        // Add to Excalidraw files with local data URL
        const newFiles = {
          ...files,
          [id]: {
            mimeType: file.type as any,
            id: id,
            dataURL: dataURL,
            created: Date.now(),
          }
        };
        updateFiles(newFiles as any);

        return {
          url: dataURL,
          id: id,
          dataURL: dataURL
        };
      }
    } catch (error) {
      console.error('Error in image upload:', error);

      // Fallback to local data URL
      const dataURL = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const id = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Add to Excalidraw files
      const newFiles = {
        ...files,
        [id]: {
          mimeType: file.type as any,
          id: id,
          dataURL: dataURL,
          created: Date.now(),
        }
      };
      updateFiles(newFiles as any);

      return {
        url: dataURL,
        id: id,
        dataURL: dataURL
      };
    }
  }, [files, updateFiles]);

  // Handle library items
  const handleAddLibraryItems = useCallback((libraryItems: LibraryItem[]) => {
    if (!excalidrawAPIRef.current) return;

    try {
      // Convert library items to Excalidraw elements
      const elementsToAdd = libraryItems.flatMap(item =>
        item.elements.map(element => ({
          ...element,
          id: `${element.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          x: element.x + Math.random() * 100, // Add some randomness to position
          y: element.y + Math.random() * 100,
        }))
      );

      if (elementsToAdd.length > 0) {
        // Add elements to the canvas
        const newElements = [...elements, ...elementsToAdd];
        updateElements(newElements);
      }
    } catch (error) {
      console.error('Error adding library items:', error);
    }
  }, [elements, updateElements]);

  // Handle OpenMoji icon selection
  const handleOpenMojiIconSelect = useCallback(async (icon: OpenMojiIcon, style: 'color' | 'black') => {
    if (!excalidrawAPIRef.current) return;

    try {
      // Get the center of the viewport for positioning
      const appState = excalidrawAPIRef.current.getAppState();
      const centerX = appState.scrollX + (appState.width || 800) / 2;
      const centerY = appState.scrollY + (appState.height || 600) / 2;

      // Create image element for the icon
      const iconUrl = openMojiService.getIconUrl(icon.hexcode, style);

      // Load the image to get its dimensions
      const img = document.createElement('img');
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          // Convert SVG to data URL for Excalidraw
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set canvas size
          canvas.width = 64;
          canvas.height = 64;

          if (ctx) {
            // Draw the image on canvas
            ctx.drawImage(img, 0, 0, 64, 64);
            const dataURL = canvas.toDataURL('image/png');

            // Create file ID
            const fileId = `openmoji_${icon.hexcode}_${Date.now()}`;

            // Add to files
            const newFiles = {
              ...files,
              [fileId]: {
                mimeType: 'image/png' as any,
                id: fileId,
                dataURL: dataURL,
                created: Date.now(),
              }
            };
            updateFiles(newFiles as any);

            // Create image element with proper Excalidraw typing
            const imageElement: ExcalidrawElement = {
              type: 'image',
              id: `openmoji_${icon.hexcode}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              x: centerX - 32, // Center the 64px icon
              y: centerY - 32,
              width: 64,
              height: 64,
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
              seed: Math.floor(Math.random() * 1000000),
              versionNonce: Math.floor(Math.random() * 1000000),
              isDeleted: false,
              boundElements: null,
              updated: 1,
              link: null,
              locked: false,
              fileId: fileId,
              status: 'saved',
              scale: [1, 1],
              // Required properties for image elements
              version: 1,
              index: 'a0' as any,
            } as any; // Type assertion to handle Excalidraw's complex typing

            // Add element to canvas
            const newElements = [...elements, imageElement as ExcalidrawElement];
            updateElements(newElements);

            console.log(`Added OpenMoji icon: ${icon.annotation} (${icon.hexcode})`);
          }
        } catch (error) {
          console.error('Error processing OpenMoji icon:', error);
        }
      };

      img.onerror = () => {
        console.error('Failed to load OpenMoji icon:', iconUrl);
      };

      img.src = iconUrl;
    } catch (error) {
      console.error('Error adding OpenMoji icon:', error);
    }
  }, [elements, files, updateElements, updateFiles, openMojiService]);

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
      if ((result as any).type === 'scene') {
        updateElements((result as any).data.elements);
        updateAppState({ ...appState, ...(result as any).data.appState });
        if ((result as any).data.files) {
          updateFiles((result as any).data.files);
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
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 mx-auto mb-4" />
          <div className="animate-pulse">Loading...</div>

        </div>
      </div>
    );
  }

  // Show welcome screen when canvas is empty
  const showWelcomeScreen = elements.length === 0 && !isLoading;

  return (
    <div className="w-full h-full relative">
      {saving && (
        <div className="absolute top-4 right-4 z-50 bg-white shadow-lg rounded-lg px-3 py-2 flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Saving...</span>
        </div>
      )}

      {/* Custom Welcome Screen */}
      {showWelcomeScreen && (
        <CanvasWelcomeScreen
          projectName={projectName}
          onGetStarted={() => {
            // Focus on the canvas to start drawing
            if (excalidrawAPIRef.current) {
              excalidrawAPIRef.current.setActiveTool({ type: 'selection' });
            }
          }}
        />
      )}

      <Excalidraw
        excalidrawAPI={(api) => {
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
        onPaste={async (data, event) => {
          // Handle image paste from clipboard
          const items = event?.clipboardData?.items;
          if (items) {
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                  try {
                    const result = await handleImageUpload(file);
                    console.log('Image pasted and uploaded:', result.url);

                    // Convert to ArrayBuffer for Excalidraw
                    const response = await fetch(result.url);
                    const arrayBuffer = await response.arrayBuffer();

                    // Add to files object
                    const newFiles = {
                      ...files,
                      [result.id]: {
                        mimeType: file.type as any,
                        id: result.id,
                        dataURL: result.url,
                        created: Date.now(),
                      }
                    };

                    updateFiles(newFiles as any);
                    return false; // Prevent default paste
                  } catch (error) {
                    console.error('Error handling pasted image:', error);
                  }
                }
              }
            }
          }
          return true; // Allow default paste for non-images
        }}
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
            // theme: false,
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
          <MainMenu.Separator />
          <MainMenu.Group title="Libraries">
            <LibraryPanel onAddLibraryItems={handleAddLibraryItems} />
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group title="Icons">
            <MainMenu.Item onSelect={() => setIsOpenMojiSidebarOpen(true)}>
              OpenMoji Icons
            </MainMenu.Item>
          </MainMenu.Group>
        </MainMenu>
        <WelcomeScreen>
          <WelcomeScreen.Center>

            <Image
              src="/logo.svg"
              alt="SketchFlow Logo"
              height={100}
              width={100}
            />
            <h1 className="text-xl">Sketchflow</h1>
            <WelcomeScreen.Center.Heading>
              Start creating your canvas
            </WelcomeScreen.Center.Heading>
          </WelcomeScreen.Center>
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

      {/* OpenMoji Sidebar */}
      <OpenMojiSidebar
        isOpen={isOpenMojiSidebarOpen}
        onClose={() => setIsOpenMojiSidebarOpen(false)}
        onIconSelect={handleOpenMojiIconSelect}
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