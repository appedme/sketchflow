"use client";

import { useEffect } from 'react';

// Performance monitoring for development
export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
      return;
    }

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('🎯 LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('⚡ FID:', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          if (!entry.hadRecentInput) {
            console.log('📐 CLS:', entry.value);
          }
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      // Some browsers might not support all entry types
      console.warn('Performance observer not fully supported');
    }

    // Monitor bundle loading times
    const logBundleLoad = (bundleName: string, startTime: number) => {
      const loadTime = performance.now() - startTime;
      console.log(`📦 ${bundleName} loaded in ${loadTime.toFixed(2)}ms`);
    };

    // Track when heavy components load
    const originalImport = window.import || (() => {});
    if (typeof originalImport === 'function') {
      window.import = async function(specifier: string) {
        const startTime = performance.now();
        const result = await originalImport(specifier);
        
        if (specifier.includes('excalidraw')) {
          logBundleLoad('Excalidraw', startTime);
        } else if (specifier.includes('plate')) {
          logBundleLoad('Plate Editor', startTime);
        }
        
        return result;
      };
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}

// Hook to measure component render times
export function useRenderTime(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) { // Only log if render takes longer than 1 frame
        console.log(`🔄 ${componentName} render: ${renderTime.toFixed(2)}ms`);
      }
    };
  });
}