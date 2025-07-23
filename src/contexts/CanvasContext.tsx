"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";

interface Canvas {
  id: string;
  projectId: string;
  title: string;
  elements?: ExcalidrawElement[];
  appState?: Partial<AppState>;
  files?: BinaryFiles;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CanvasContextType {
  canvas: Canvas | null;
  isLoading: boolean;
  error: any;
  elements: readonly ExcalidrawElement[];
  appState: Partial<AppState>;
  files: BinaryFiles;
  saving: boolean;
  updateElements: (elements: readonly ExcalidrawElement[]) => void;
  updateAppState: (appState: Partial<AppState>) => void;
  updateFiles: (files: BinaryFiles) => void;
  saveCanvas: () => Promise<void>;
  reloadCanvas: () => Promise<void>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

interface CanvasProviderProps {
  children: ReactNode;
  projectId: string;
  canvasId?: string;
  shareToken?: string; // For public access
}

export function CanvasProvider({ children, projectId, canvasId, shareToken }: CanvasProviderProps) {
  const user = shareToken ? null : useUser(); // Don't require user in public mode
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<Partial<AppState>>({
    collaborators: new Map(),
  });
  const [files, setFiles] = useState<BinaryFiles>({});
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<string>('');

  // Load canvas data directly without caching
  const loadCanvasData = useCallback(async () => {
    if (!shareToken && !user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const apiUrl = shareToken && canvasId
        ? `/api/public/canvases/${canvasId}?shareToken=${shareToken}`
        : canvasId
        ? `/api/canvas/${canvasId}/load`
        : `/api/canvas/project/${projectId}/load`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error('Failed to load canvas');
      }

      const canvasData = await response.json();
      
      const newElements = canvasData?.elements || [];
      const newAppState = {
        ...canvasData?.appState,
        collaborators: new Map(), // Ensure collaborators is always a Map
      };
      const newFiles = canvasData?.files || {};

      setElements(newElements);
      setAppState(newAppState);
      setFiles(newFiles);

      // Update the last saved state reference
      lastSavedStateRef.current = JSON.stringify({
        elements: newElements,
        appState: newAppState,
        files: newFiles
      });
    } catch (err) {
      console.error('Failed to load canvas:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [shareToken, user?.id, canvasId, projectId]);

  // Load canvas on mount and when dependencies change
  useEffect(() => {
    loadCanvasData();
  }, [loadCanvasData]);

  const updateElements = useCallback((newElements: readonly ExcalidrawElement[]) => {
    setElements(newElements);
    scheduleAutoSave(newElements, appState, files);
  }, [appState, files]);

  const updateAppState = useCallback((newAppState: Partial<AppState>) => {
    setAppState(newAppState);
    scheduleAutoSave(elements, newAppState, files);
  }, [elements, files]);

  const updateFiles = useCallback((newFiles: BinaryFiles) => {
    setFiles(newFiles);
    scheduleAutoSave(elements, appState, newFiles);
  }, [elements, appState]);

  const scheduleAutoSave = useCallback((
    elementsToSave: readonly ExcalidrawElement[],
    appStateToSave: Partial<AppState>,
    filesToSave: BinaryFiles
  ) => {
    // Don't auto-save in public mode
    if (shareToken) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Check if state has actually changed
    const currentState = JSON.stringify({
      elements: elementsToSave,
      appState: appStateToSave,
      files: filesToSave
    });

    if (currentState === lastSavedStateRef.current) {
      return; // No changes, skip save
    }

    // Schedule new save
    saveTimeoutRef.current = setTimeout(() => {
      saveCanvasData(elementsToSave, appStateToSave, filesToSave);
    }, 1000); // Auto-save after 1 second of inactivity
  }, []);

  const saveCanvasData = useCallback(async (
    elementsToSave: readonly ExcalidrawElement[],
    appStateToSave: Partial<AppState>,
    filesToSave: BinaryFiles
  ) => {
    if (!user?.id || shareToken) return; // Don't save in public mode

    try {
      setSaving(true);

      const saveUrl = canvasId
        ? `/api/canvas/${canvasId}/save`
        : `/api/canvas/project/${projectId}/save`;

      const response = await fetch(saveUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          elements: elementsToSave,
          appState: appStateToSave,
          files: filesToSave,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save canvas');
      }

      const result = await response.json();

      // Update the last saved state reference
      lastSavedStateRef.current = JSON.stringify({
        elements: elementsToSave,
        appState: appStateToSave,
        files: filesToSave
      });

    } catch (error) {
      console.error('Failed to save canvas:', error);
    } finally {
      setSaving(false);
    }
  }, [user?.id, canvasId, projectId]);

  const saveCanvas = useCallback(async () => {
    await saveCanvasData(elements, appState, files);
  }, [elements, appState, files, saveCanvasData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <CanvasContext.Provider
      value={{
        canvas: null, // Remove canvas object since we're not caching
        isLoading,
        error,
        elements,
        appState,
        files,
        saving,
        updateElements,
        updateAppState,
        updateFiles,
        saveCanvas,
        reloadCanvas: loadCanvasData,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvas() {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
}