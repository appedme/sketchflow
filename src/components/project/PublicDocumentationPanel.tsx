"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus,
  FileText,
  PencilRuler as CanvasIcon,
  Search,
  Loader2,
  MoreHorizontal,
  Maximize,
  SplitSquareHorizontal,
  Home,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  updatedAt: string;
}

interface Canvas {
  id: string;
  title: string;
  updatedAt: string;
}

interface PublicDocumentationPanelProps {
  project: any;
  shareToken: string;
  className?: string;
  onItemSelect?: (itemId: string, type: 'document' | 'canvas') => void;
}

export function PublicDocumentationPanel({
  project,
  shareToken,
  className,
  onItemSelect
}: PublicDocumentationPanelProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  // Get current file ID from URL
  const getCurrentFileId = () => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const documentMatch = path.match(/\/document\/([^\/]+)/);
    const canvasMatch = path.match(/\/canvas\/([^\/]+)/);
    return documentMatch?.[1] || canvasMatch?.[1] || null;
  };

  const currentFileId = getCurrentFileId();

  // Use project data directly (already loaded)
  const documents = project.documents || [];
  const canvases = project.canvases || [];

  // Filter items based on search
  const filteredDocs = documents.filter((doc: Document) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCanvases = canvases.filter((canvas: Canvas) =>
    canvas.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileClick = async (fileId: string, type: 'document' | 'canvas') => {
    setLoadingFileId(fileId);
    try {
      if (onItemSelect) {
        onItemSelect(fileId, type);
      } else {
        // Navigate to the shared item view
        const url = type === 'document'
          ? `/share/${shareToken}?doc=${fileId}`
          : `/share/${shareToken}?canvas=${fileId}`;
        router.push(url);
      }
    } finally {
      // Clear loading after a short delay to show the animation
      setTimeout(() => setLoadingFileId(null), 500);
    }
  };

  const goToSketchFlow = () => {
    window.open('https://sketchflow.space', '_blank');
  };

  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/10"
              onClick={goToSketchFlow}
              title="Go to SketchFlow"
            >
              <Home className="w-3 h-3" />
            </Button>
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary" />
            </div>
            <h2 className="font-medium text-sm">Files</h2>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Public View
            </span>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-sm bg-background"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="p-2 border-b bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8 text-xs justify-center gap-1.5"
          onClick={goToSketchFlow}
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Create Your Own Project
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <div className="space-y-1">
            {/* Documents */}
            {filteredDocs.map((doc: Document) => (
              <div key={doc.id} className={cn(
                "group flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors cursor-pointer",
                currentFileId === doc.id && "bg-primary/10 border border-primary/20"
              )}>
                {loadingFileId === doc.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                      <span className="text-sm text-blue-600 font-medium">Opening...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <FileText className={cn(
                      "h-4 w-4 flex-shrink-0",
                      currentFileId === doc.id ? "text-primary" : "text-blue-500"
                    )} />
                    <button
                      onClick={() => handleFileClick(doc.id, 'document')}
                      className={cn(
                        "text-sm truncate flex-1 text-left transition-colors",
                        currentFileId === doc.id && "text-primary font-medium"
                      )}
                    >
                      {doc.title}
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Canvases */}
            {filteredCanvases.map((canvas: Canvas) => (
              <div key={canvas.id} className={cn(
                "group flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors cursor-pointer",
                currentFileId === canvas.id && "bg-primary/10 border border-primary/20"
              )}>
                {loadingFileId === canvas.id ? (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="relative">
                      <CanvasIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <div className="absolute inset-0 animate-pulse bg-purple-500/20 rounded" />
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                      <Loader2 className="h-3 w-3 animate-spin text-purple-500" />
                      <span className="text-sm text-purple-600 font-medium">Opening...</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <CanvasIcon className={cn(
                      "h-4 w-4 flex-shrink-0",
                      currentFileId === canvas.id ? "text-primary" : "text-purple-500"
                    )} />
                    <button
                      onClick={() => handleFileClick(canvas.id, 'canvas')}
                      className={cn(
                        "text-sm truncate flex-1 text-left transition-colors",
                        currentFileId === canvas.id && "text-primary font-medium"
                      )}
                    >
                      {canvas.title}
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Empty state */}
            {filteredDocs.length === 0 && filteredCanvases.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-3">
                  {searchTerm ? 'No files found' : 'No files in this project'}
                </p>
                {!searchTerm && (
                  <Button size="sm" onClick={goToSketchFlow} className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Your Own Project
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}