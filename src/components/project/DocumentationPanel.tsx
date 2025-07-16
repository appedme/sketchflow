"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Plus,
  FileText,
  PencilRuler as CanvasIcon,
  Search,
  Menu,
  Loader2,
  MoreHorizontal,
  Edit2,
  SplitSquareHorizontal,
  Maximize,
  Trash2,
  Share,
  Download,
  Upload,
  Settings,
  FolderOpen
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

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

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveRename = async (id: string, type: 'document' | 'canvas') => {
    if (!editingTitle.trim()) return;

    try {
      const endpoint = type === 'document' ? `/api/documents/${id}` : `/api/canvas/${id}`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      });

      if (!response.ok) throw new Error('Failed to rename');

      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename:', error);
    }
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const deleteItem = async (id: string, type: 'document' | 'canvas', title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const endpoint = type === 'document' ? `/api/documents/${id}` : `/api/canvas/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error(`Failed to delete ${type}`);

      // Refresh the lists
      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };

  const shareProject = () => {
    // This will be handled by the ShareDialog component in the parent
    const event = new CustomEvent('openShareDialog', { detail: { projectId, projectName } });
    window.dispatchEvent(event);
  };

  const exportProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`);
      if (!response.ok) throw new Error('Failed to export project');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${projectName}-export.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Failed to export project. Please try again.');
    }
  };

  const importProject = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        
        // Basic validation
        if (!data.project || !data.documents || !data.canvases) {
          throw new Error('Invalid project file format');
        }

        alert('Import functionality will be implemented soon. File format is valid.');
      } catch (error) {
        console.error('Error importing project:', error);
        alert('Failed to import project. Please check the file format.');
      }
    };
    input.click();
  };

  const openProjectSettings = () => {
    router.push(`/project/${projectId}/settings`);
  };

  const PanelContent = () => (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary" />
            </div>
            <h2 className="font-medium text-sm">Files</h2>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-primary/10">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={createNewDocument} className="gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  New Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={createNewCanvas} className="gap-2">
                  <CanvasIcon className="h-4 w-4 text-purple-500" />
                  New Canvas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-primary/10">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={shareProject} className="gap-2">
                  <Share className="h-4 w-4" />
                  Share Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportProject} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={importProject} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Project
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push(`/project/${projectId}`)} className="gap-2">
                  <FolderOpen className="h-4 w-4" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={openProjectSettings} className="gap-2">
                  <Settings className="h-4 w-4" />
                  Project Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <div key={doc.id} className="group flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                  {editingId === doc.id ? (
                    <>
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(doc.id, 'document');
                          if (e.key === 'Escape') cancelRename();
                        }}
                        onBlur={() => saveRename(doc.id, 'document')}
                        className="h-6 text-sm flex-1"
                        autoFocus
                      />
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <button
                        onClick={() => router.push(`/project/${projectId}/document/${doc.id}`)}
                        className="text-sm truncate flex-1 text-left"
                      >
                        {doc.title}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startRename(doc.id, doc.title)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/project/${projectId}/document/${doc.id}`)}
                            className="gap-2"
                          >
                            <Maximize className="h-4 w-4" />
                            Full Screen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/project/${projectId}/split?left=${doc.id}&leftType=document`)}
                            className="gap-2"
                          >
                            <SplitSquareHorizontal className="h-4 w-4" />
                            Split View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteItem(doc.id, 'document', doc.title)} 
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              ))}

              {/* Canvases */}
              {filteredCanvases.map((canvas) => (
                <div key={canvas.id} className="group flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors">
                  {editingId === canvas.id ? (
                    <>
                      <CanvasIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(canvas.id, 'canvas');
                          if (e.key === 'Escape') cancelRename();
                        }}
                        onBlur={() => saveRename(canvas.id, 'canvas')}
                        className="h-6 text-sm flex-1"
                        autoFocus
                      />
                    </>
                  ) : (
                    <>
                      <CanvasIcon className="h-4 w-4 text-purple-500 flex-shrink-0" />
                      <button
                        onClick={() => router.push(`/project/${projectId}/canvas/${canvas.id}`)}
                        className="text-sm truncate flex-1 text-left"
                      >
                        {canvas.title}
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => startRename(canvas.id, canvas.title)} className="gap-2">
                            <Edit2 className="h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/project/${projectId}/canvas/${canvas.id}`)}
                            className="gap-2"
                          >
                            <Maximize className="h-4 w-4" />
                            Full Screen
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push(`/project/${projectId}/split?left=${canvas.id}&leftType=canvas`)}
                            className="gap-2"
                          >
                            <SplitSquareHorizontal className="h-4 w-4" />
                            Split View
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => deleteItem(canvas.id, 'canvas', canvas.title)} 
                            className="gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
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