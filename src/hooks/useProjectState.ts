"use client";

import { useState, useCallback, useEffect } from 'react';
import type { ExcalidrawImperativeAPI, AppState } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export function useProjectState(projectId: string, excalidrawAPI: ExcalidrawImperativeAPI | null) {
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [appState, setAppState] = useState<Partial<AppState>>({
    viewBackgroundColor: "#ffffff",
    currentItemFontFamily: 1,
    currentItemFontSize: 16,
    currentItemStrokeColor: "#1e1e1e",
    currentItemBackgroundColor: "transparent",
    currentItemFillStyle: "solid",
    currentItemStrokeWidth: 2,
    currentItemRoughness: 1,
    currentItemOpacity: 100,
    gridSize: undefined,
    theme: "light",
  });
  
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [zenModeEnabled, setZenModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(true);

  // Load from database on mount
  useEffect(() => {
    const loadCanvasData = async () => {
      try {
        // Try to load from server first
        const response = await fetch(`/api/canvas/${projectId}`);
        if (response.ok) {
          const canvasData = await response.json();
          setElements(canvasData.elements || []);
          setAppState(prev => ({ ...prev, ...canvasData.appState }));
          setTheme(canvasData.appState?.theme || "light");
          return;
        }
      } catch (error) {
        console.error("Failed to load canvas from server:", error);
      }
      
      // Fallback to localStorage
      const savedData = localStorage.getItem(`excalidraw-${projectId}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setElements(parsed.elements || []);
          setAppState(prev => ({ ...prev, ...parsed.appState }));
          setTheme(parsed.appState?.theme || "light");
        } catch (error) {
          console.error("Failed to load saved canvas:", error);
        }
      }
    };
    
    loadCanvasData();
  }, [projectId]);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setAppState(prev => ({
      ...prev,
      theme: newTheme,
      viewBackgroundColor: newTheme === "dark" ? "#1e1e1e" : "#ffffff"
    }));
  }, [theme]);

  const toggleViewMode = useCallback(() => {
    setViewModeEnabled(prev => !prev);
  }, []);

  const toggleZenMode = useCallback(() => {
    setZenModeEnabled(prev => !prev);
  }, []);

  const toggleGridMode = useCallback(() => {
    setGridModeEnabled(prev => !prev);
  }, []);

  const resetCanvas = useCallback(() => {
    if (window.confirm("Are you sure you want to clear the canvas? This action cannot be undone.")) {
      setElements([]);
      excalidrawAPI?.resetScene();
    }
  }, [excalidrawAPI]);

  const fitToContent = useCallback(() => {
    if (excalidrawAPI && elements.length > 0) {
      excalidrawAPI.scrollToContent(elements, {
        fitToContent: true,
        animate: true
      });
    }
  }, [excalidrawAPI, elements]);

  return {
    elements,
    appState,
    theme,
    viewModeEnabled,
    zenModeEnabled,
    gridModeEnabled,
    setElements,
    setAppState,
    toggleTheme,
    toggleViewMode,
    toggleZenMode,
    toggleGridMode,
    resetCanvas,
    fitToContent
  };
}