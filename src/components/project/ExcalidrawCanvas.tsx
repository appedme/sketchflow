'use client';
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
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
import { PexelsSidebar } from '@/components/canvas/PexelsSidebar';
import { PexelsService, PexelsPhoto } from '@/lib/services/pexels';
import Image from "next/image";
import { FileText, PencilRuler as CanvasIcon, Smile, Camera } from 'lucide-react';

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
  const router = useRouter();
  const excalidrawAPIRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sceneFileInputRef = useRef<HTMLInputElement>(null);

  // OpenMoji sidebar state
  const [isOpenMojiSidebarOpen, setIsOpenMojiSidebarOpen] = useState(false);
  const openMojiService = useMemo(() => OpenMojiService.getInstance(), []);

  // Pexels sidebar state
  const [isPexelsSidebarOpen, setIsPexelsSidebarOpen] = useState(false);
  const pexelsService = useMemo(() => PexelsService.getInstance(), []);

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

  // Handle Pexels image selection
  const handlePexelsImageSelect = useCallback(async (photo: PexelsPhoto) => {
    if (!excalidrawAPIRef.current) {
      console.error('Excalidraw API not available');
      return;
    }

    console.log('Adding Pexels image:', photo.alt, photo.id);

    try {
      // Get the center of the viewport for positioning
      const appState = excalidrawAPIRef.current.getAppState();
      const centerX = (appState.scrollX || 0) + (appState.width || 800) / 2;
      const centerY = (appState.scrollY || 0) + (appState.height || 600) / 2;

      // Use medium size for better quality
      const imageUrl = photo.src.medium;
      console.log('Image URL:', imageUrl);

      // Create a unique file ID
      const fileId = `pexels-${photo.id}-${Date.now()}`;

      // Fetch the image and convert to data URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      console.log('Image converted to data URL, length:', dataUrl.length);

      // Create the file object for Excalidraw
      const fileObject = {
        mimeType: blob.type as const,
        id: fileId,
        dataURL: dataUrl,
        created: Date.now(),
        lastRetrieved: Date.now()
      };

      // Calculate dimensions while maintaining aspect ratio
      const maxWidth = 300;
      const maxHeight = 300;
      const aspectRatio = photo.width / photo.height;

      let width = maxWidth;
      let height = maxWidth / aspectRatio;

      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * aspectRatio;
      }

      // Create image element
      const imageElement = {
        type: 'image' as const,
        id: `pexels-element-${photo.id}-${Date.now()}`,
        x: centerX - width / 2,
        y: centerY - height / 2,
        width: width,
        height: height,
        angle: 0,
        strokeColor: 'transparent',
        backgroundColor: 'transparent',
        fillStyle: 'solid' as const,
        strokeWidth: 0,
        strokeStyle: 'solid' as const,
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: Math.floor(Math.random() * 1000000),
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        fileId: fileId,
        status: 'saved' as const,
        scale: [1, 1] as [number, number]
      };

      console.log('Created image element with fileId:', fileId);

      // Get current scene state
      const currentElements = excalidrawAPIRef.current.getSceneElements();
      const currentFiles = excalidrawAPIRef.current.getFiles();

      // Create new files object with our file
      const newFiles = {
        ...currentFiles,
        [fileId]: fileObject
      };

      // Create new elements array with our element
      const newElements = [...currentElements, imageElement];

      console.log('Updating scene with new element and file...');

      // Update the scene with both new element and file
      excalidrawAPIRef.current.updateScene({
        elements: newElements,
        files: newFiles,
      });

      console.log(`✅ Successfully added Pexels image: ${photo.alt}`);
      console.log('📊 New elements count:', newElements.length);
      console.log('📁 New files count:', Object.keys(newFiles).length);
      console.log('🔗 File ID:', fileId);

      // Close the sidebar after adding image
      setIsPexelsSidebarOpen(false);

    } catch (error) {
      console.error('Error adding Pexels image:', error);
      alert(`Failed to add image: ${photo.alt}. Please try again.`);
    }
  }, []);

  // Handle OpenMoji icon selection - using proper Excalidraw file handling
  const handleOpenMojiIconSelect = useCallback(async (icon: OpenMojiIcon, style: 'color' | 'black') => {
    if (!excalidrawAPIRef.current) {
      console.error('Excalidraw API not available');
      return;
    }

    console.log('Adding OpenMoji icon:', icon.annotation, icon.hexcode, style);

    try {
      // Get the center of the viewport for positioning
      const appState = excalidrawAPIRef.current.getAppState();
      const centerX = (appState.scrollX || 0) + (appState.width || 800) / 2;
      const centerY = (appState.scrollY || 0) + (appState.height || 600) / 2;

      // Get icon URL
      const iconUrl = openMojiService.getIconUrl(icon.hexcode, style);
      console.log('Icon URL:', iconUrl);

      // Create a unique file ID
      const fileId = `openmoji-${icon.hexcode}-${Date.now()}`;

      // Fetch the SVG content and convert to PNG data URL
      const response = await fetch(iconUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch icon: ${response.status} ${response.statusText}`);
      }

      const svgText = await response.text();
      console.log('SVG fetched successfully, length:', svgText.length);

      // Convert SVG to PNG data URL using proper method
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;

      const img = document.createElement('img');

      const pngDataUrl = await new Promise<string>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            canvas.width = 64;
            canvas.height = 64;
            ctx.drawImage(img, 0, 0, 64, 64);

            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => reject(new Error('Failed to load SVG image'));
        img.src = svgDataUrl;
      });

      console.log('PNG data URL created, length:', pngDataUrl.length);

      // Create the file object for Excalidraw
      const fileObject = {
        mimeType: 'image/png' as const,
        id: fileId,
        dataURL: pngDataUrl,
        created: Date.now(),
        lastRetrieved: Date.now()
      };

      // Create image element using consistent ID
      const imageElement = {
        type: 'image' as const,
        id: `openmoji-element-${icon.hexcode}-${Date.now()}`,
        x: centerX - 32,
        y: centerY - 32,
        width: 64,
        height: 64,
        angle: 0,
        strokeColor: 'transparent',
        backgroundColor: 'transparent',
        fillStyle: 'solid' as const,
        strokeWidth: 0,
        strokeStyle: 'solid' as const,
        roughness: 0,
        opacity: 100,
        groupIds: [],
        frameId: null,
        roundness: null,
        seed: Math.floor(Math.random() * 1000000),
        versionNonce: Math.floor(Math.random() * 1000000),
        isDeleted: false,
        boundElements: null,
        updated: Date.now(),
        link: null,
        locked: false,
        fileId: fileId, // This must match the file object ID
        status: 'saved' as const,
        scale: [1, 1] as [number, number]
      };

      console.log('Created image element with fileId:', fileId);

      // Get current scene state
      const currentElements = excalidrawAPIRef.current.getSceneElements();
      const currentFiles = excalidrawAPIRef.current.getFiles();

      console.log('Current elements:', currentElements.length);
      console.log('Current files:', Object.keys(currentFiles).length);

      // Create new files object with our file
      const newFiles = {
        ...currentFiles,
        [fileId]: fileObject
      };

      // Create new elements array with our element
      const newElements = [...currentElements, imageElement];

      console.log('Updating scene with new element and file...');
      console.log('File object:', fileObject);

      // Update the scene with both new element and file
      excalidrawAPIRef.current.updateScene({
        elements: newElements,
        files: newFiles,
      });

      console.log(`✅ Successfully added OpenMoji icon: ${icon.annotation}`);
      console.log('� New  elements count:', newElements.length);
      console.log('📁 New files count:', Object.keys(newFiles).length);
      console.log('🔗 File ID:', fileId);

      // Verify the element was actually added
      setTimeout(() => {
        const verifyElements = excalidrawAPIRef.current!.getSceneElements();
        const verifyFiles = excalidrawAPIRef.current!.getFiles();
        console.log('🔍 Verification - Elements in scene:', verifyElements.length);
        console.log('🔍 Verification - Files in scene:', Object.keys(verifyFiles).length);
        console.log('🔍 Verification - Our element exists:', verifyElements.some(el => el.id.includes(icon.hexcode)));
        console.log('🔍 Verification - Our file exists:', fileId in verifyFiles);
      }, 100);

      // Close the sidebar after adding icon
      setIsOpenMojiSidebarOpen(false);

    } catch (error) {
      console.error('Error adding OpenMoji icon:', error);
      alert(`Failed to add icon: ${icon.annotation}. Please try again.`);
    }
  }, [openMojiService]);

  // Create new document and canvas functions
  const createNewDocument = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Document', contentText: '' }),
      });
      if (!response.ok) throw new Error('Failed to create document');
      const newDoc = await response.json() as { id: string };
      router.push(`/project/${projectId}/document/${newDoc.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  }, [projectId, router]);

  const createNewCanvas = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/canvases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Canvas', elements: [] }),
      });
      if (!response.ok) throw new Error('Failed to create canvas');
      const newCanvas = await response.json() as { id: string };
      router.push(`/project/${projectId}/canvas/${newCanvas.id}`);
    } catch (error) {
      console.error('Failed to create canvas:', error);
    }
  }, [projectId, router]);

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
        <div className="absolute bottom-0 right-0 z-50 bg-white shadow-md rounded-lg px-4 py-2 flex items-center gap-2 border border-gray-100">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-sm font-medium text-gray-700">Saving changes...</span>
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
          <MainMenu.Group title="Create">
            <MainMenu.Item
              icon={<FileText className="h-5 w-5 text-blue-500" />}
              onSelect={createNewDocument}
            >
              New Document
            </MainMenu.Item>
            <MainMenu.Item
              icon={<CanvasIcon className="h-5 w-5 text-purple-500" />}
              onSelect={createNewCanvas}
            >
              New Canvas
            </MainMenu.Item>
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group title="Libraries">
            <LibraryPanel onAddLibraryItems={handleAddLibraryItems} />
          </MainMenu.Group>
          <MainMenu.Separator />
          <MainMenu.Group title="Icons">
            <MainMenu.Item
              icon={<Smile className="h-5 w-5 text-blue-500" />}
              onSelect={() => setIsOpenMojiSidebarOpen(true)}
            >
              OpenMoji Icons
            </MainMenu.Item>
            <MainMenu.Item
              icon={<Camera className="h-5 w-5 text-green-500" />}
              onSelect={() => setIsPexelsSidebarOpen(true)}
            >
              Pexels Images
            </MainMenu.Item>
          </MainMenu.Group>
          <MainMenu.Separator />

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

      {/* Pexels Sidebar */}
      <PexelsSidebar
        isOpen={isPexelsSidebarOpen}
        onClose={() => setIsPexelsSidebarOpen(false)}
        onImageSelect={handlePexelsImageSelect}
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