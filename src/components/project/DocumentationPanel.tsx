"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';


import {
  FileText,
  PencilRuler as CanvasIcon,
  Menu,
  Loader2,
  MoreHorizontal,
  Edit2,
  SplitSquareHorizontal,
  Maximize,
  Trash2,
  Clock
} from 'lucide-react';
import { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { useApi, usePublicApi } from '@/hooks/useApi';

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
  const user = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Optimistic updates state (managed by parent layout now)
  const [optimisticItems, setOptimisticItems] = useState<{
    documents: Document[];
    canvases: Canvas[];
  }>({ documents: [], canvases: [] });

  // Clear optimistic states when project changes
  useEffect(() => {
    resetOptimisticState();
  }, [projectId]);

  const resetOptimisticState = () => {
    setOptimisticItems({ documents: [], canvases: [] });
    setLoadingFileId(null);
  };

  // Get current file ID from URL
  const getCurrentFileId = () => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const documentMatch = path.match(/\/document\/([^\/]+)/);
    const canvasMatch = path.match(/\/canvas\/([^\/]+)/);
    return documentMatch?.[1] || canvasMatch?.[1] || null;
  };

  const currentFileId = getCurrentFileId();

  // Fetch data - use public API if user is not authenticated
  const apiHook = user ? useApi : usePublicApi;
  const { data: documents = [], isLoading: docsLoading } = apiHook<Document[]>(
    `/api/projects/${projectId}/documents`
  );
  const { data: canvases = [], isLoading: canvasLoading } = apiHook<Canvas[]>(
    `/api/projects/${projectId}/canvases`
  );
  const { data: project } = apiHook(`/api/projects/${projectId}`);

  const isLoading = docsLoading || canvasLoading;

  // Merge optimistic items with real data
  const allDocuments = [...documents, ...optimisticItems.documents];
  const allCanvases = [...canvases, ...optimisticItems.canvases];

  // Filter items by search term
  const displayDocs = allDocuments
    .filter(doc => doc.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const displayCanvases = allCanvases
    .filter(canvas => canvas.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());



  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveRename = async (id: string, type: 'document' | 'canvas') => {
    if (!editingTitle.trim()) return;

    const newTitle = editingTitle.trim();

    // Clear editing state immediately
    setEditingId(null);
    setEditingTitle('');

    try {
      const endpoint = type === 'document' ? `/api/documents/${id}` : `/api/canvas/${id}`;
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) throw new Error('Failed to rename');

      // Update SWR cache for both document and canvas lists
      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);

      // Also update the specific item cache if it exists
      if (type === 'document') {
        mutate(`/api/documents/${id}`);
      } else {
        mutate(`/api/canvas/${id}`);
      }
    } catch (error) {
      console.error('Failed to rename:', error);
      alert('Failed to rename. Please try again.');

      // Restore editing state on error
      setEditingId(id);
      setEditingTitle(newTitle);
    }
  };

  const cancelRename = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleFileClick = (id: string, type: 'document' | 'canvas') => {
    // Don't navigate to temporary items
    if (id.startsWith('temp-')) return;

    // Show loading state immediately
    setLoadingFileId(id);

    // Navigate to the file
    const path = `/project/${projectId}/${type}/${id}`;
    router.push(path);

    // Clear loading state after a short delay (the page will change anyway)
    setTimeout(() => setLoadingFileId(null), 1000);
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

      // Refresh the lists in SWR cache
      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);

      // Remove the specific item from cache
      if (type === 'document') {
        mutate(`/api/documents/${id}`, null, false);
      } else {
        mutate(`/api/canvas/${id}`, null, false);
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}. Please try again.`);
    }
  };











  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const PanelContent = () => (
    <div className={cn("h-full flex flex-col", className)}>

      {/* File List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
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
              <div className={cn(
                viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-1'
              )}>
                {/* Documents */}
                {displayDocs.map((doc) => (
                  <div key={doc.id} className={cn(
                    "group rounded hover:bg-accent transition-colors",
                    currentFileId === doc.id && "bg-primary/10 border border-primary/20",
                    viewMode === 'grid' ? 'p-3 flex flex-col gap-2' : 'flex items-center gap-2 p-2'
                  )}>
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
                            <div className={cn(
                              "flex-1",
                              viewMode === 'grid' ? 'flex flex-col gap-1' : 'flex items-center gap-2'
                            )}>
                              <button
                                onClick={() => handleFileClick(doc.id, 'document')}
                                className={cn(
                                  "text-sm truncate text-left transition-colors hover:text-primary",
                                  currentFileId === doc.id && "text-primary font-medium",
                                  viewMode === 'grid' ? 'font-medium' : 'flex-1',
                                  doc.id.startsWith('temp-') && "opacity-60 cursor-not-allowed"
                                )}
                                disabled={doc.id.startsWith('temp-')}
                              >
                                {doc.title}
                                {doc.id.startsWith('temp-') && (
                                  <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                                )}
                              </button>
                              {viewMode === 'grid' && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(doc.updatedAt)}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        {user && (
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
                              <DropdownMenuItem
                                onClick={() => startRename(doc.id, doc.title)}
                                className="gap-2"
                                disabled={doc.id.startsWith('temp-')}
                              >
                                <Edit2 className="h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleFileClick(doc.id, 'document')}
                                className="gap-2"
                                disabled={doc.id.startsWith('temp-')}
                              >
                                <Maximize className="h-4 w-4" />
                                Full Screen
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/project/${projectId}/split?left=${doc.id}&leftType=document`)}
                                className="gap-2"
                                disabled={doc.id.startsWith('temp-')}
                              >
                                <SplitSquareHorizontal className="h-4 w-4" />
                                Split View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteItem(doc.id, 'document', doc.title)}
                                className="gap-2 text-red-600 focus:text-red-600"
                                disabled={doc.id.startsWith('temp-')}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Canvases */}
                {displayCanvases.map((canvas) => (
                  <div key={canvas.id} className={cn(
                    "group rounded hover:bg-accent transition-colors",
                    currentFileId === canvas.id && "bg-primary/10 border border-primary/20",
                    viewMode === 'grid' ? 'p-3 flex flex-col gap-2' : 'flex items-center gap-2 p-2'
                  )}>
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
                            <div className={cn(
                              "flex-1",
                              viewMode === 'grid' ? 'flex flex-col gap-1' : 'flex items-center gap-2'
                            )}>
                              <button
                                onClick={() => handleFileClick(canvas.id, 'canvas')}
                                className={cn(
                                  "text-sm truncate text-left transition-colors hover:text-primary",
                                  currentFileId === canvas.id && "text-primary font-medium",
                                  viewMode === 'grid' ? 'font-medium' : 'flex-1',
                                  canvas.id.startsWith('temp-') && "opacity-60 cursor-not-allowed"
                                )}
                                disabled={canvas.id.startsWith('temp-')}
                              >
                                {canvas.title}
                                {canvas.id.startsWith('temp-') && (
                                  <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                                )}
                              </button>
                              {viewMode === 'grid' && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatDate(canvas.updatedAt)}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                        {user && (
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
                              <DropdownMenuItem
                                onClick={() => startRename(canvas.id, canvas.title)}
                                className="gap-2"
                                disabled={canvas.id.startsWith('temp-')}
                              >
                                <Edit2 className="h-4 w-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleFileClick(canvas.id, 'canvas')}
                                className="gap-2"
                                disabled={canvas.id.startsWith('temp-')}
                              >
                                <Maximize className="h-4 w-4" />
                                Full Screen
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/project/${projectId}/split?left=${canvas.id}&leftType=canvas`)}
                                className="gap-2"
                                disabled={canvas.id.startsWith('temp-')}
                              >
                                <SplitSquareHorizontal className="h-4 w-4" />
                                Split View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteItem(canvas.id, 'canvas', canvas.title)}
                                className="gap-2 text-red-600 focus:text-red-600"
                                disabled={canvas.id.startsWith('temp-')}
                              >
                                <Trash2 className="h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* Empty state */}
                {!isLoading && displayDocs.length === 0 && displayCanvases.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground mb-3">
                      {searchTerm ? 'No files found' : 'No files yet'}
                    </p>
                    {!searchTerm && (
                      <p className="text-xs text-muted-foreground">
                        Use the "New" button in the top navigation to create files
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
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

      </>
    );
  }

  return <PanelContent />;
}