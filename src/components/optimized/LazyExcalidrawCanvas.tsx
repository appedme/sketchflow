"use client";

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

// Lazy load Excalidraw with proper error boundary
const ExcalidrawCanvas = lazy(() => 
  import('@/components/project/ExcalidrawCanvas')
    .then(mod => ({ default: mod.ExcalidrawCanvas }))
    .catch(error => {
      console.error('Failed to load ExcalidrawCanvas:', error);
      // Return a fallback component
      return { 
        default: () => (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center space-y-4">
              <p className="text-red-600">Failed to load canvas editor</p>
              <Button onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )
      };
    })
);

interface LazyExcalidrawCanvasProps {
  projectId: string;
  projectName: string;
  canvasId?: string;
  isReadOnly?: boolean;
  shareToken?: string;
  className?: string;
}

// Enhanced loading component with progress indication
function CanvasLoadingFallback() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center  ">
      <div className="text-center space-y-6 max-w-md">
        <Loading size="lg" text="Loading Canvas Editor..." />
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Initializing drawing tools...</p>
          <p className="text-xs">This may take a moment on first load</p>
        </div>
      </div>
    </div>
  );
}

// Error boundary for canvas loading
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; onRetry?: () => void },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Canvas loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-gray-50">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-600 space-y-2">
              <h3 className="font-semibold">Canvas Loading Error</h3>
              <p className="text-sm">The canvas editor failed to load properly.</p>
            </div>
            <div className="space-x-2">
              <Button 
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onRetry?.();
                }}
                variant="outline"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function LazyExcalidrawCanvas(props: LazyExcalidrawCanvasProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <div className={`h-full w-full ${props.className || ''}`}>
      <CanvasErrorBoundary onRetry={() => setRetryKey(prev => prev + 1)}>
        <Suspense fallback={<CanvasLoadingFallback />}>
          <ExcalidrawCanvas key={retryKey} {...props} />
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
}