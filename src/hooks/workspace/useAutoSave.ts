"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { updateCanvas } from '@/lib/actions/canvases';

export function useAutoSave(
  projectId: string,
  canvasId: string,
  elements: unknown[],
  appState: Record<string, unknown>
) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const saveProject = useCallback(async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      // Save to database via server action
      await updateCanvas(canvasId, elements, appState);
      
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      setLastSaved(timeString);
      
      console.log("Canvas saved successfully");
    } catch (error) {
      console.error("Failed to save canvas:", error);
      // Fallback to localStorage on error
      const data = {
        elements,
        appState,
        timestamp: Date.now()
      };
      localStorage.setItem(`excalidraw-${projectId}`, JSON.stringify(data));
    } finally {
      setIsSaving(false);
    }
  }, [canvasId, elements, appState, isSaving]);

  // Auto-save when elements or appState change
  useEffect(() => {
    if (elements.length === 0) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save (debounced)
    saveTimeoutRef.current = setTimeout(() => {
      saveProject();
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [elements, appState, saveProject]);

  // Load last saved time on mount
  useEffect(() => {
    const savedData = localStorage.getItem(`excalidraw-${projectId}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.timestamp) {
          const savedTime = new Date(parsed.timestamp);
          const timeString = savedTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          setLastSaved(timeString);
        }
      } catch (error) {
        console.error("Failed to load save timestamp:", error);
      }
    }
  }, [projectId]);

  return {
    saveProject,
    lastSaved,
    isSaving
  };
}