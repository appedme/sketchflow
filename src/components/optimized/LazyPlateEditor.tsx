"use client";

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText } from 'lucide-react';

// Lazy load Plate editor with chunked loading
const PlateDocumentEditor = lazy(() =>
  import('@/components/project/PlateDocumentEditor')
    .then(mod => ({ default: mod.PlateDocumentEditor }))
    .catch(error => {
      console.error('Failed to load PlateDocumentEditor:', error);
      return {
        default: () => (
          <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="text-center space-y-4">
              <p className="text-red-600">Failed to load document editor</p>
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

interface LazyPlateEditorProps {
  documentId: string;
  projectId: string;
  projectName?: string;
  isReadOnly?: boolean;
  className?: string;
  shareToken?: string;
  onContentChange?: (updates: any) => () => void;
  onSave?: (updates: any) => Promise<void>;
}

// Enhanced loading component for document editor
function DocumentLoadingFallback() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Initializing...');

  useEffect(() => {
    const stages = [
      'Initializing editor...',
      'Loading plugins...',
      'Setting up toolbar...',
      'Preparing document...',
      'Almost ready...'
    ];

    let stageIndex = 0;
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newProgress = prev + Math.random() * 12;

        // Update stage based on progress
        const targetStage = Math.floor((newProgress / 100) * stages.length);
        if (targetStage !== stageIndex && targetStage < stages.length) {
          stageIndex = targetStage;
          setLoadingStage(stages[stageIndex]);
        }

        return newProgress >= 90 ? 90 : newProgress;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Document Editor</h3>
            <p className="text-sm text-muted-foreground">Loading rich text editor...</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{loadingStage}</p>
          <p className="text-xs">This may take a moment on first load</p>
        </div>
      </div>
    </div>
  );
}

// Error boundary for document editor
class DocumentErrorBoundary extends React.Component<
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
    console.error('Document editor loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full w-full flex items-center justify-center bg-background">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-red-600 space-y-2">
              <h3 className="font-semibold">Document Editor Error</h3>
              <p className="text-sm">The document editor failed to load properly.</p>
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

export function LazyPlateEditor(props: LazyPlateEditorProps) {
  const [retryKey, setRetryKey] = useState(0);

  return (
    <div className={`h-full w-full ${props.className || ''}`}>
      <DocumentErrorBoundary onRetry={() => setRetryKey(prev => prev + 1)}>
        <Suspense fallback={<DocumentLoadingFallback />}>
          <PlateDocumentEditor
            key={retryKey}
            {...props}
            onContentChange={props.onContentChange}
            onSave={props.onSave}
          />
        </Suspense>
      </DocumentErrorBoundary>
    </div>
  );
}