'use client';
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import { useRouter } from 'next/navigation';
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
  Sidebar,
  convertToExcalidrawElements,
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
import { FileText, PencilRuler as CanvasIcon, Smile, Camera, FileTextIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  canvasId?: string;
  isReadOnly?: boolean;
  shareToken?: string; // For public access
}

function ExcalidrawCanvasContent({
  projectId,
  projectName,
  canvasId,
  isReadOnly = false,
  shareToken
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

  const { theme } = useTheme();

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
  const handleLibraryChange = useCallback((libraryItems: LibraryItems) => {
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
        <MainMenu>
          {/* File Operations */}
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.DefaultItems.SaveToActiveFile />
          <MainMenu.DefaultItems.SaveAsImage />
          <MainMenu.DefaultItems.Export />
          <MainMenu.Separator />

          {/* Canvas Operations */}
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.Item
            icon={<FileText size={14} />}
            onClick={() => {
              if (excalidrawAPIRef.current) {
                const elements = excalidrawAPIRef.current.getSceneElements();
                const hasElements = elements && elements.length > 0;
                if (hasElements && confirm('Are you sure you want to clear the canvas? This action cannot be undone.')) {
                  excalidrawAPIRef.current.updateScene({
                    elements: [],
                  });
                }
              }
            }}
          >
            Clear All
          </MainMenu.Item>

          {/* View Options */}
          <MainMenu.Separator />
          <MainMenu.Item
            icon={<Camera size={14} />}
            onClick={() => {
              if (excalidrawAPIRef.current) {
                excalidrawAPIRef.current.scrollToContent();
              }
            }}
          >
            Fit to Content
          </MainMenu.Item>

          <MainMenu.Item
            icon={<Smile size={14} />}
            onClick={() => {
              if (excalidrawAPIRef.current) {
                excalidrawAPIRef.current.resetZoom();
              }
            }}
          >
            Reset Zoom
          </MainMenu.Item>

          {/* Project Navigation */}
          <MainMenu.Separator />
          <MainMenu.Item
            icon={<FileTextIcon size={14} />}
            onClick={() => {
              router.push(`/project/${projectId}`);
            }}
          >
            Back to Project
          </MainMenu.Item>

          <MainMenu.Item
            icon={<CanvasIcon size={14} />}
            onClick={() => {
              router.push('/dashboard');
            }}
          >
            Dashboard
          </MainMenu.Item>

          {/* Settings & Help */}
          <MainMenu.Separator />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.Help />

          {/* Project Info */}
          <MainMenu.Separator />
          <MainMenu.Item
            icon={<FileText size={14} />}
            onClick={() => {
              alert(`Project: ${projectName}\nCanvas ID: ${canvasId || 'Main Canvas'}`);
            }}
          >
            Canvas Info
          </MainMenu.Item>
        </MainMenu>

        <WelcomeScreen>
          <CanvasWelcomeScreen
            projectName={projectName}
            isReadOnly={isReadOnly || !!shareToken}
          />
        </WelcomeScreen>

        {!isReadOnly && !shareToken && (
          <>
            <Sidebar name="library" tab="library">
              <LibraryPanel />
            </Sidebar>

            <Sidebar name="openmoji" tab="openmoji">
              <OpenMojiSidebar
                isOpen={isOpenMojiSidebarOpen}
                onClose={() => setIsOpenMojiSidebarOpen(false)}
                onEmojiSelect={(emoji: OpenMojiIcon) => {
                  if (excalidrawAPIRef.current) {
                    // Add emoji to canvas
                    const newElement = {
                      type: "text" as const,
                      x: 100,
                      y: 100,
                      width: 50,
                      height: 50,
                      text: emoji.emoji,
                      fontSize: 40,
                      fontFamily: 1,
                      textAlign: "center" as const,
                      verticalAlign: "middle" as const,
                    };

                    const elements = convertToExcalidrawElements([newElement]);
                    excalidrawAPIRef.current.updateScene({
                      elements: [...(excalidrawAPIRef.current.getSceneElements() || []), ...elements],
                    });
                  }
                }}
              />
            </Sidebar>

            <Sidebar name="pexels" tab="pexels">
              <PexelsSidebar
                isOpen={isPexelsSidebarOpen}
                onClose={() => setIsPexelsSidebarOpen(false)}
                onImageSelect={async (photo: PexelsPhoto) => {
                  if (excalidrawAPIRef.current) {
                    try {
                      // Create image element
                      const img = new Image();
                      img.crossOrigin = "anonymous";
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                          canvas.width = img.width;
                          canvas.height = img.height;
                          ctx.drawImage(img, 0, 0);

                          const dataURL = canvas.toDataURL('image/png');

                          const newElement = {
                            type: "image" as const,
                            x: 100,
                            y: 100,
                            width: Math.min(img.width, 400),
                            height: Math.min(img.height, 300),
                            fileId: `pexels-${photo.id}`,
                          };

                          const elements = convertToExcalidrawElements([newElement]);
                          const files = {
                            [`pexels-${photo.id}`]: {
                              mimeType: "image/png",
                              id: `pexels-${photo.id}`,
                              dataURL: dataURL,
                              created: Date.now(),
                            }
                          };

                          excalidrawAPIRef.current?.updateScene({
                            elements: [...(excalidrawAPIRef.current.getSceneElements() || []), ...elements],
                            files: {
                              ...excalidrawAPIRef.current.getFiles(),
                              ...files
                            }
                          });
                        }
                      };
                      img.src = photo.src.medium;
                    } catch (error) {
                      console.error('Error adding Pexels image:', error);
                    }
                  }
                }}
              />
            </Sidebar>
          </>
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