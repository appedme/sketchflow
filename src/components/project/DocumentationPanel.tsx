"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Plus,
  FileText,
  PencilRuler as CanvasIcon,
  Search,
  Menu,
  Loader2
} from 'lucide-react';
import { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';

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

interface DocumentationPanelProps {
  projectId: string;
  projectName: string;
  className?: string;
  isMobile?: boolean;
}

export function DocumentationPanel({
  projectId,
  projectName,
  className,
  isMobile = false
}: DocumentationPanelProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: documents = [], isLoading: docsLoading } = useApi<Document[]>(
    `/api/projects/${projectId}/documents`
  );
  const { data: canvases = [], isLoading: canvasLoading } = useApi<Canvas[]>(
    `/api/projects/${projectId}/canvases`
  );

  const isLoading = docsLoading || canvasLoading;

  // Filter items based on search
  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCanvases = canvases.filter(canvas =>
    canvas.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewDocument = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Document', contentText: '' }),
      });
      if (!response.ok) throw new Error('Failed to create document');
      const newDoc = await response.json();
      mutate(`/api/projects/${projectId}/documents`);
      router.push(`/project/${projectId}/document/${newDoc.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const createNewCanvas = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/canvases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Canvas', elements: [] }),
      });
      if (!response.ok) throw new Error('Failed to create canvas');
      const newCanvas = await response.json();
      mutate(`/api/projects/${projectId}/canvases`);
      router.push(`/project/${projectId}/canvas/${newCanvas.id}`);
    } catch (error) {
      console.error('Failed to create canvas:', error);
    }
  };

  const PanelContent = () => (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-muted-foreground">Files</h2>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded animate-pulse">
                  <div className="w-4 h-4 bg-muted rounded" />
                  <div className="h-4 bg-muted rounded flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {/* Documents */}
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => router.push(`/project/${projectId}/document/${doc.id}`)}
                  className="w-full flex items-center gap-2 p-2 text-left rounded hover:bg-accent transition-colors"
                >
                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-sm truncate">{doc.title}</span>
                </button>
              ))}

              {/* Canvases */}
              {filteredCanvases.map((canvas) => (
                <button
                  key={canvas.id}
                  onClick={() => router.push(`/project/${projectId}/canvas/${canvas.id}`)}
                  className="w-full flex items-center gap-2 p-2 text-left rounded hover:bg-accent transition-colors"
                >
                  <CanvasIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <span className="text-sm truncate">{canvas.title}</span>
                </button>
              ))}

              {/* Empty state */}
              {!isLoading && filteredDocs.length === 0 && filteredCanvases.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground mb-3">
                    {searchTerm ? 'No files found' : 'No files yet'}
                  </p>
                  {!searchTerm && (
                    <div className="space-y-2">
                      <Button size="sm" onClick={createNewDocument} className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        New Document
                      </Button>
                      <Button size="sm" variant="outline" onClick={createNewCanvas} className="w-full">
                        <CanvasIcon className="h-4 w-4 mr-2" />
                        New Canvas
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2">
            <Menu className="w-4 h-4" />
            Files
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <PanelContent />
        </SheetContent>
      </Sheet>
    );
  }

  return <PanelContent />;
}