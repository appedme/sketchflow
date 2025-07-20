"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Preload strategies for heavy components
export function useComponentPreloader() {
  const [preloadedComponents, setPreloadedComponents] = useState<Set<string>>(new Set());
  const router = useRouter();

  const preloadExcalidraw = async () => {
    if (preloadedComponents.has('excalidraw')) return;
    
    try {
      // Preload Excalidraw in the background
      await import('@excalidraw/excalidraw');
      await import('@/components/project/ExcalidrawCanvas');
      
      setPreloadedComponents(prev => new Set(prev).add('excalidraw'));
      console.log('✅ Excalidraw preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload Excalidraw:', error);
    }
  };

  const preloadPlateEditor = async () => {
    if (preloadedComponents.has('plate')) return;
    
    try {
      // Preload Plate editor components
      await import('platejs/react');
      await import('@/components/editor/editor-kit');
      await import('@/components/project/PlateDocumentEditor');
      
      setPreloadedComponents(prev => new Set(prev).add('plate'));
      console.log('✅ Plate editor preloaded successfully');
    } catch (error) {
      console.warn('Failed to preload Plate editor:', error);
    }
  };

  const preloadOnHover = (componentType: 'canvas' | 'document') => {
    if (componentType === 'canvas') {
      preloadExcalidraw();
    } else if (componentType === 'document') {
      preloadPlateEditor();
    }
  };

  const preloadOnIdle = () => {
    // Use requestIdleCallback if available, otherwise setTimeout
    const schedulePreload = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 5000 });
      } else {
        setTimeout(callback, 2000);
      }
    };

    // Preload Excalidraw first (usually heavier)
    schedulePreload(preloadExcalidraw);
    
    // Then preload Plate editor
    schedulePreload(() => {
      setTimeout(preloadPlateEditor, 1000);
    });
  };

  return {
    preloadExcalidraw,
    preloadPlateEditor,
    preloadOnHover,
    preloadOnIdle,
    preloadedComponents
  };
}

// Component to handle intelligent preloading
export function PreloadManager({ children }: { children: React.ReactNode }) {
  const { preloadOnIdle } = useComponentPreloader();

  useEffect(() => {
    // Start preloading after initial page load
    const timer = setTimeout(preloadOnIdle, 1000);
    return () => clearTimeout(timer);
  }, [preloadOnIdle]);

  return <>{children}</>;
}

// Hook for route-based preloading
export function useRoutePreloader() {
  const router = useRouter();
  const { preloadExcalidraw, preloadPlateEditor } = useComponentPreloader();

  useEffect(() => {
    // Preload based on current route
    const path = window.location.pathname;
    
    if (path.includes('/canvas/')) {
      preloadExcalidraw();
    } else if (path.includes('/document/')) {
      preloadPlateEditor();
    } else if (path.includes('/project/')) {
      // Preload both for project workspace
      preloadExcalidraw();
      setTimeout(preloadPlateEditor, 500);
    }
  }, [preloadExcalidraw, preloadPlateEditor]);

  return { preloadExcalidraw, preloadPlateEditor };
}