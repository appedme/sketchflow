"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ShareDialog } from './ShareDialog';
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
  FolderOpen,
  ArrowLeft,
  Home,
  Moon,
  Sun,
  ExternalLink
} from 'lucide-react';
import { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';
import { useTheme } from 'next-themes';

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
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  // Get current file ID from URL
  const getCurrentFileId = () => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname;
    const documentMatch = path.match(/\/document\/([^\/]+)/);
    const canvasMatch = path.match(/\/canvas\/([^\/]+)/);
    return documentMatch?.[1] || canvasMatch?.[1] || null;
  };

  const currentFileId = getCurrentFileId();

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
      const newDoc = await response.json() as { id: string };
      // Update SWR cache
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
      const newCanvas = await response.json() as { id: string };
      // Update SWR cache
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

      // Update SWR cache for both document and canvas lists
      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);

      // Also update the specific item cache if it exists
      if (type === 'document') {
        mutate(`/api/documents/${id}`);
      } else {
        mutate(`/api/canvas/${id}`);
      }

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

  const shareProject = () => {
    setShareDialogOpen(true);
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



  const openProjectSettings = () => {
    router.push(`/project/${projectId}/settings`);
  };

  const handleFileClick = async (fileId: string, type: 'document' | 'canvas') => {
    setLoadingFileId(fileId);
    try {
      const url = type === 'document'
        ? `/project/${projectId}/document/${fileId}`
        : `/project/${projectId}/canvas/${fileId}`;
      router.push(url);
    } finally {
      // Clear loading after a short delay to show the animation
      setTimeout(() => setLoadingFileId(null), 500);
    }
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  const PanelContent = () => (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Header */}
      <div className="p-4 border-b space-y-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-primary/10"
              onClick={goToDashboard}
              title="Back to Dashboard"
            >
              <Home className="w-3 h-3" />
            </Button>
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

      {/* Project Actions */}
      <div className="p-2 border-b bg-muted/20">
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-center gap-1.5"
            onClick={shareProject}
          >
            <Share className="h-3.5 w-3.5" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs justify-center gap-1.5"
            onClick={exportProject}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
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
                <div key={doc.id} className={cn(
                  "group flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors",
                  currentFileId === doc.id && "bg-primary/10 border border-primary/20"
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
                <div key={canvas.id} className={cn(
                  "group flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors",
                  currentFileId === canvas.id && "bg-primary/10 border border-primary/20"
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

      {/* Bottom Controls */}
      <div className="p-3 border-t bg-muted/30 space-y-2">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Theme</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-7 w-7 p-0"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={shareProject}
            className="flex-1 gap-2 h-8"
          >
            <Share className="h-3 w-3" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportProject}
            className="flex-1 gap-2 h-8"
          >
            <Download className="h-3 w-3" />
            Export
          </Button>
        </div>

        {/* Project Link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/project/${projectId}`)}
          className="w-full gap-2 h-8 text-xs"
        >
          <ExternalLink className="h-3 w-3" />
          Open Project View
        </Button>
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
        <ShareDialog
          projectId={projectId}
          projectName={projectName}
          isOpen={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
        />
      </>
    );
  }

  return (
    <>
      <PanelContent />
      <ShareDialog
        projectId={projectId}
        projectName={projectName}
        isOpen={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
      />
    </>
  );
}