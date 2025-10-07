"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

import {
  FileText,
  PencilRuler as CanvasIcon,
  Menu,
  Search,
  Plus,
  Grid3X3,
  List,
  Filter,
  Star,
  StarOff,
  Loader2,
  MoreHorizontal,
  Edit2,
  SplitSquareHorizontal,
  Maximize,
  Trash2,
  Clock,
  Eye,
  Download,
  Share2,
  FolderOpen,
  Zap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Hash,
  X
} from 'lucide-react';
import { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { useApi, usePublicApi } from '@/hooks/useApi';

interface Document {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  isFavorite?: boolean;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  wordCount?: number;
  readingTime?: number;
  lastEditedBy?: string;
}

interface Canvas {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  isFavorite?: boolean;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  elementCount?: number;
  lastEditedBy?: string;
}

interface DocumentationPanelProps {
  projectId: string;
  projectName: string;
  className?: string;
  isMobile?: boolean;
}

type ViewMode = 'list' | 'grid' | 'compact';
type FilterType = 'all' | 'documents' | 'canvases' | 'favorites' | 'recent';
type SortType = 'updated' | 'created' | 'name' | 'size';

export function DocumentationPanel({
  projectId,
  projectName,
  className,
  isMobile = false
}: DocumentationPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUser();
  
  // Core state
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('updated');
  const [showFilters, setShowFilters] = useState(false);
  
  // Interaction state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  
  // Animation states
  const [recentlyCreated, setRecentlyCreated] = useState<Set<string>>(new Set());
  const [recentlyUpdated, setRecentlyUpdated] = useState<Set<string>>(new Set());

  // Get current file info from URL
  const currentFileInfo = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const documentMatch = pathname.match(/\/document\/([^\/]+)/);
    const canvasMatch = pathname.match(/\/canvas\/([^\/]+)/);
    return {
      id: documentMatch?.[1] || canvasMatch?.[1] || null,
      type: documentMatch ? 'document' : canvasMatch ? 'canvas' : null
    };
  }, [pathname]);

  // API hooks
  const apiHook = user ? useApi : usePublicApi;
  const { data: documents = [], isLoading: docsLoading, error: docsError } = apiHook<Document[]>(
    `/api/projects/${projectId}/documents`
  );
  const { data: canvases = [], isLoading: canvasLoading, error: canvasError } = apiHook<Canvas[]>(
    `/api/projects/${projectId}/canvases`
  );
  const { data: project } = apiHook(`/api/projects/${projectId}`);

  const isLoading = docsLoading || canvasLoading;
  const hasError = docsError || canvasError;

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let items: Array<(Document | Canvas) & { type: 'document' | 'canvas' }> = [];
    
    // Combine and type items
    if (filterType === 'all' || filterType === 'documents') {
      items.push(...documents.map(doc => ({ ...doc, type: 'document' as const })));
    }
    if (filterType === 'all' || filterType === 'canvases') {
      items.push(...canvases.map(canvas => ({ ...canvas, type: 'canvas' as const })));
    }
    
    // Apply filters
    if (filterType === 'favorites') {
      items = items.filter(item => item.isFavorite);
    } else if (filterType === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      items = items.filter(item => new Date(item.updatedAt) > weekAgo);
    }
    
    // Apply search
    if (searchTerm) {
      items = items.filter(item => 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Apply sorting
    items.sort((a, b) => {
      switch (sortType) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'size':
          if (a.type === 'document' && b.type === 'document') {
            return ((b as Document).wordCount || 0) - ((a as Document).wordCount || 0);
          } else if (a.type === 'canvas' && b.type === 'canvas') {
            return ((b as Canvas).elementCount || 0) - ((a as Canvas).elementCount || 0);
          }
          return a.type === 'document' ? -1 : 1;
        case 'updated':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });
    
    return items;
  }, [documents, canvases, filterType, searchTerm, sortType]);

  // Statistics
  const stats = useMemo(() => ({
    total: documents.length + canvases.length,
    documents: documents.length,
    canvases: canvases.length,
    favorites: [...documents, ...canvases].filter(item => item.isFavorite).length,
    recent: [...documents, ...canvases].filter(item => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(item.updatedAt) > weekAgo;
    }).length
  }), [documents, canvases]);

  // Handlers
  const handleFileClick = (id: string, type: 'document' | 'canvas') => {
    if (id.startsWith('temp-')) return;
    
    setLoadingFileId(id);
    const path = `/project/${projectId}/${type}/${id}`;
    router.push(path);
    
    setTimeout(() => setLoadingFileId(null), 1000);
  };

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditingTitle(currentTitle);
  };

  const saveRename = async (id: string, type: 'document' | 'canvas') => {
    if (!editingTitle.trim()) return;

    const newTitle = editingTitle.trim();
    const originalItem = type === 'document' 
      ? documents.find(doc => doc.id === id)
      : canvases.find(canvas => canvas.id === id);

    if (!originalItem || originalItem.title === newTitle) {
      setEditingId(null);
      setEditingTitle('');
      return;
    }

    // Add to recently updated
    setRecentlyUpdated(prev => new Set([...prev, id]));
    setTimeout(() => {
      setRecentlyUpdated(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 2000);

    // Optimistic update
    const updatedItem = { ...originalItem, title: newTitle, updatedAt: new Date().toISOString() };
    
    if (type === 'document') {
      mutate(`/api/projects/${projectId}/documents`, 
        documents.map(doc => doc.id === id ? updatedItem : doc), false);
      mutate(`/api/documents/${id}`, updatedItem, false);
    } else {
      mutate(`/api/projects/${projectId}/canvases`, 
        canvases.map(canvas => canvas.id === id ? updatedItem : canvas), false);
      mutate(`/api/canvas/${id}`, updatedItem, false);
    }

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

      // Refresh cache
      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);
    } catch (error) {
      console.error('Failed to rename:', error);
      
      // Revert optimistic update
      if (type === 'document') {
        mutate(`/api/projects/${projectId}/documents`, 
          documents.map(doc => doc.id === id ? originalItem : doc), false);
        mutate(`/api/documents/${id}`, originalItem, false);
      } else {
        mutate(`/api/projects/${projectId}/canvases`, 
          canvases.map(canvas => canvas.id === id ? originalItem : canvas), false);
        mutate(`/api/canvas/${id}`, originalItem, false);
      }
      
      setEditingId(id);
      setEditingTitle(originalItem.title);
    }
  };

  const toggleFavorite = async (id: string, type: 'document' | 'canvas') => {
    const originalItem = type === 'document' 
      ? documents.find(doc => doc.id === id)
      : canvases.find(canvas => canvas.id === id);

    if (!originalItem) return;

    const updatedItem = { ...originalItem, isFavorite: !originalItem.isFavorite };
    
    // Optimistic update
    if (type === 'document') {
      mutate(`/api/projects/${projectId}/documents`, 
        documents.map(doc => doc.id === id ? updatedItem : doc), false);
    } else {
      mutate(`/api/projects/${projectId}/canvases`, 
        canvases.map(canvas => canvas.id === id ? updatedItem : canvas), false);
    }

    try {
      const endpoint = type === 'document' ? `/api/documents/${id}` : `/api/canvas/${id}`;
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !originalItem.isFavorite }),
      });
    } catch (error) {
      // Revert on error
      if (type === 'document') {
        mutate(`/api/projects/${projectId}/documents`, 
          documents.map(doc => doc.id === id ? originalItem : doc), false);
      } else {
        mutate(`/api/projects/${projectId}/canvases`, 
          canvases.map(canvas => canvas.id === id ? originalItem : canvas), false);
      }
    }
  };

  const deleteItem = async (id: string, type: 'document' | 'canvas', title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const endpoint = type === 'document' ? `/api/documents/${id}` : `/api/canvas/${id}`;
      const response = await fetch(endpoint, { method: 'DELETE' });

      if (!response.ok) throw new Error(`Failed to delete ${type}`);

      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getItemIcon = (item: any) => {
    const isActive = currentFileInfo?.id === item.id;
    const isLoading = loadingFileId === item.id;
    const isTemp = item.id.startsWith('temp-');
    
    if (item.type === 'document') {
      return (
        <div className="relative">
          <FileText className={cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-blue-600",
            isTemp && "opacity-60"
          )} />
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded" />
          )}
          {recentlyUpdated.has(item.id) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          )}
        </div>
      );
    } else {
      return (
        <div className="relative">
          <CanvasIcon className={cn(
            "h-4 w-4",
            isActive ? "text-primary" : "text-purple-600",
            isTemp && "opacity-60"
          )} />
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-purple-500/20 rounded" />
          )}
          {recentlyUpdated.has(item.id) && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping" />
          )}
        </div>
      );
    }
  };

  const renderItem = (item: any) => {
    const isActive = currentFileInfo?.id === item.id;
    const isLoading = loadingFileId === item.id;
    const isTemp = item.id.startsWith('temp-');
    const isEditing = editingId === item.id;

    if (viewMode === 'compact') {
      return (
        <div key={item.id} className={cn(
          "group flex items-center gap-2 px-2 py-1.5 rounded-md transition-all",
          "hover:bg-accent/50 cursor-pointer",
          isActive && "bg-primary/10 border border-primary/20",
          isTemp && "opacity-60"
        )}>
          {getItemIcon(item)}
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename(item.id, item.type);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onBlur={() => saveRename(item.id, item.type)}
              className="h-6 text-xs flex-1"
              autoFocus
            />
          ) : (
            <>
              <button
                onClick={() => handleFileClick(item.id, item.type)}
                className={cn(
                  "text-xs truncate text-left flex-1 transition-colors",
                  isActive ? "font-medium text-primary" : "hover:text-primary",
                  isTemp && "cursor-not-allowed"
                )}
                disabled={isTemp}
              >
                {item.title}
              </button>
              {item.isFavorite && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </>
          )}
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <Card key={item.id} className={cn(
          "group transition-all hover:shadow-md cursor-pointer",
          isActive && "ring-2 ring-primary/20 bg-primary/5",
          isTemp && "opacity-60"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {getItemIcon(item)}
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(item.id, item.type);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => saveRename(item.id, item.type)}
                    className="h-7 text-sm font-medium"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => handleFileClick(item.id, item.type)}
                    className={cn(
                      "text-sm font-medium truncate text-left w-full transition-colors",
                      isActive ? "text-primary" : "hover:text-primary",
                      isTemp && "cursor-not-allowed"
                    )}
                    disabled={isTemp}
                  >
                    {item.title}
                    {isTemp && (
                      <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
                    )}
                  </button>
                )}
                
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {/* <Clock className="h-3 w-3" /> */}
                  {formatDate(item.updatedAt)}
                  
                  {item.type === 'document' && (item as Document).wordCount && (
                    <>
                      <span>•</span>
                      <span>{(item as Document).wordCount} words</span>
                    </>
                  )}
                  
                  {item.type === 'canvas' && (item as Canvas).elementCount && (
                    <>
                      <span>•</span>
                      <span>{(item as Canvas).elementCount} elements</span>
                    </>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 2).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 2 && (
                      <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                        +{item.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {item.isFavorite && (
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
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
                        onClick={() => startRename(item.id, item.title)}
                        disabled={isTemp}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleFavorite(item.id, item.type)}
                        disabled={isTemp}
                      >
                        {item.isFavorite ? (
                          <>
                            <StarOff className="h-4 w-4 mr-2" />
                            Remove from favorites
                          </>
                        ) : (
                          <>
                            <Star className="h-4 w-4 mr-2" />
                            Add to favorites
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteItem(item.id, item.type, item.title)}
                        className="text-red-600 focus:text-red-600"
                        disabled={isTemp}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // List view (default)
    return (
      <div key={item.id} className={cn(
        "group flex items-center gap-3 p-3 rounded-lg transition-all",
        "hover:bg-accent/50 cursor-pointer border border-transparent",
        isActive && "bg-primary/10 border-primary/20",
        isTemp && "opacity-60"
      )}>
        {getItemIcon(item)}
        
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveRename(item.id, item.type);
                if (e.key === 'Escape') setEditingId(null);
              }}
              onBlur={() => saveRename(item.id, item.type)}
              className="h-8 text-sm font-medium"
              autoFocus
            />
          ) : (
            <button
              onClick={() => handleFileClick(item.id, item.type)}
              className={cn(
                "text-sm font-medium truncate text-left w-full transition-colors",
                isActive ? "text-primary" : "hover:text-primary",
                isTemp && "cursor-not-allowed"
              )}
              disabled={isTemp}
            >
              {item.title}
              {isTemp && (
                <Badge variant="secondary" className="ml-2 text-xs">New</Badge>
              )}
            </button>
          )}
          
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {/* <Clock className="h-3 w-3" /> */}
            {formatDate(item.updatedAt)}
            
            {item.type === 'document' && (item as Document).wordCount && (
              <>
                <span>•</span>
                <span>{(item as Document).wordCount} words</span>
              </>
            )}
            
            {item.type === 'canvas' && (item as Canvas).elementCount && (
              <>
                <span>•</span>
                <span>{(item as Canvas).elementCount} elements</span>
              </>
            )}

            {item.status && (
              <>
                <span>•</span>
                <Badge variant={
                  item.status === 'published' ? 'default' : 
                  item.status === 'draft' ? 'secondary' : 'outline'
                } className="text-xs px-1.5 py-0">
                  {item.status}
                </Badge>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.isFavorite && (
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
          )}
          
          {isLoading && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
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
                  onClick={() => startRename(item.id, item.title)}
                  disabled={isTemp}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleFileClick(item.id, item.type)}
                  disabled={isTemp}
                >
                  <Maximize className="h-4 w-4 mr-2" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/project/${projectId}/split?left=${item.id}&leftType=${item.type}`)}
                  disabled={isTemp}
                >
                  <SplitSquareHorizontal className="h-4 w-4 mr-2" />
                  Split View
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => toggleFavorite(item.id, item.type)}
                  disabled={isTemp}
                >
                  {item.isFavorite ? (
                    <>
                      <StarOff className="h-4 w-4 mr-2" />
                      Remove from favorites
                    </>
                  ) : (
                    <>
                      <Star className="h-4 w-4 mr-2" />
                      Add to favorites
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteItem(item.id, item.type, item.title)}
                  className="text-red-600 focus:text-red-600"
                  disabled={isTemp}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const PanelContent = () => (
    <TooltipProvider>
      <div className={cn("h-full flex flex-col bg-background", className)}>
        {/* Header */}
        <div className="p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm truncate">{projectName}</h2>
            </div>
            
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn("h-7 w-7 p-0", showFilters && "bg-accent")}
                  >
                    <Filter className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Filters</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewMode(viewMode === 'list' ? 'grid' : viewMode === 'grid' ? 'compact' : 'list')}
                    className="h-7 w-7 p-0"
                  >
                    {viewMode === 'list' ? <List className="h-3 w-3" /> : 
                     viewMode === 'grid' ? <Grid3X3 className="h-3 w-3" /> : 
                     <Menu className="h-3 w-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View: {viewMode}</TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 text-sm"
            />
            {searchTerm && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span>{stats.total} total</span>
            <span>{stats.documents} docs</span>
            <span>{stats.canvases} canvases</span>
            {stats.favorites > 0 && <span>{stats.favorites} ★</span>}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-3 border-b bg-muted/30">
            <Tabs value={filterType} onValueChange={(value) => setFilterType(value as FilterType)}>
              <TabsList className="grid w-full grid-cols-5 h-8">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs">Docs</TabsTrigger>
                <TabsTrigger value="canvases" className="text-xs">Canvas</TabsTrigger>
                <TabsTrigger value="favorites" className="text-xs">★</TabsTrigger>
                <TabsTrigger value="recent" className="text-xs">Recent</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Sort:</span>
              <Button
                size="sm"
                variant={sortType === 'updated' ? 'default' : 'outline'}
                onClick={() => setSortType('updated')}
                className="h-6 text-xs px-2"
              >
                Updated
              </Button>
              <Button
                size="sm"
                variant={sortType === 'name' ? 'default' : 'outline'}
                onClick={() => setSortType('name')}
                className="h-6 text-xs px-2"
              >
                Name
              </Button>
              <Button
                size="sm"
                variant={sortType === 'created' ? 'default' : 'outline'}
                onClick={() => setSortType('created')}
                className="h-6 text-xs px-2"
              >
                Created
              </Button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3">
              {hasError ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Failed to load files</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded animate-pulse">
                      <div className="w-4 h-4 bg-muted rounded" />
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-1" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    {searchTerm ? (
                      <>
                        <Search className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No files found</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try adjusting your search or filters
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No files yet</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Create your first document or canvas
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className={cn(
                  viewMode === 'grid' ? 'grid grid-cols-1 gap-3' :
                  viewMode === 'compact' ? 'space-y-1' : 'space-y-2'
                )}>
                  {filteredData.map(renderItem)}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </TooltipProvider>
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