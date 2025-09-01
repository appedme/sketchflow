"use client";

import { useCallback } from 'react';
import { exportToCanvas, exportToSvg } from "@excalidraw/excalidraw";
import type { AppState, ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export function useExcalidrawExport(
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  elements: readonly ExcalidrawElement[],
  appState: Partial<AppState>,
  projectName: string
) {
  const exportCanvas = useCallback(async (type: "png" | "svg" | "json") => {
    if (!excalidrawAPI || elements.length === 0) {
      console.warn("No elements to export or API not ready");
      return;
    }

    try {
      switch (type) {
        case "png": {
          const canvas = await exportToCanvas({
            elements,
            appState: appState as AppState,
            files: excalidrawAPI.getFiles(),
            getDimensions: () => ({ width: 1920, height: 1080 })
          });
          
          canvas.toBlob((blob: Blob | null) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = `${projectName}.png`;
              link.click();
              URL.revokeObjectURL(url);
            }
          }, "image/png");
          break;
        }
        
        case "svg": {
          const svg = await exportToSvg({
            elements,
            appState: appState as AppState,
            files: excalidrawAPI.getFiles(),
          });
          
          const svgData = new XMLSerializer().serializeToString(svg);
          const blob = new Blob([svgData], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${projectName}.svg`;
          link.click();
          URL.revokeObjectURL(url);
          break;
        }
        
        case "json": {
          const data = {
            type: "excalidraw",
            version: 2,
            source: "https://sketchflow.space",
            elements,
            appState,
            files: excalidrawAPI.getFiles()
          };
          
          const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: "application/json" 
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${projectName}.excalidraw`;
          link.click();
          URL.revokeObjectURL(url);
          break;
        }
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  }, [excalidrawAPI, elements, appState, projectName]);

  return { exportCanvas };
}