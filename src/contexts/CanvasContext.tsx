"use client";

import React, { createContext, useContext, ReactNode, useState, useCallback, useRef, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
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
  mutateCanvas: () => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

interface CanvasProviderProps {
  children: ReactNode;
  projectId: string;
  canvasId?: string;
}

export function CanvasProvider({ children, projectId, canvasId }: CanvasProviderProps) {
  const user = useUser();
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<Partial<AppState>>({
    collaborators: new Map(),
  });
  const [files, setFiles] = useState<BinaryFiles>({});
  const [saving, setSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<string>('');

  // Determine the correct API endpoint
  const apiUrl = canvasId
    ? `/api/canvas/${canvasId}/load`
    : `/api/canvas/project/${projectId}/load`;

  const { data: canvasData, error, mutate: mutateCanvas } = useSWR(
    user?.id ? apiUrl : null,
    fetcher
  );

  // Initialize local state when canvas loads
  useEffect(() => {
    if (canvasData) {
      const newElements = (canvasData as any)?.elements || [];
      const newAppState = {
        ...(canvasData as any)?.appState,
        collaborators: new Map(), // Ensure collaborators is always a Map
      };
      const newFiles = (canvasData as any)?.files || {};

      setElements(newElements);
      setAppState(newAppState);
      setFiles(newFiles);

      // Update the last saved state reference
      lastSavedStateRef.current = JSON.stringify({
        elements: newElements,
        appState: newAppState,
        files: newFiles
      });
    }
  }, [canvasData]);

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
    if (!user?.id) return;

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

      // Update the cache optimistically
      const cacheKey = canvasId
        ? `/api/canvas/${canvasId}/load`
        : `/api/canvas/project/${projectId}/load`;

      mutate(cacheKey, {
        elements: elementsToSave,
        appState: appStateToSave,
        files: filesToSave
      }, false);

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

  const isLoading = !canvasData && !error;

  return (
    <CanvasContext.Provider
      value={{
        canvas: (canvasData as any) || null,
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
        mutateCanvas,
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