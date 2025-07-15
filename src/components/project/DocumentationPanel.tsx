"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Plus,
  FileText,
  PencilRuler as CanvasIcon,
  Search,
  SplitSquareHorizontal,
  X,
  Maximize2,
  Edit2,
  Check,
  X as XIcon,
  MoreHorizontal,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Eye,
  Copy,
  Trash2,
  Star,
  StarOff,
  FolderPlus,
  Folder,
  ChevronRight,
  ChevronDown,
  Menu,
  ArrowUpDown,
  Hash,
  Type,
  Image,
  Link,
  Bookmark,
  Tag,
  Users,
  Share2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useSWR, { mutate } from 'swr';
import { cn } from '@/lib/utils';

interface Document {
  id: string;
  title: string;
  contentText: string;
  type: 'document';
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  tags?: string[];
  wordCount?: number;
}

interface Canvas {
  id: string;
  title: string;
  elements: any[];
  type: 'canvas';
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  tags?: string[];
  elementCount?: number;
}

type ContentItem = (Document | Canvas) & {
  type: 'document' | 'canvas';
};

interface DocumentationPanelProps {
  projectId: string;
  projectName: string;
  className?: string;
  isMobile?: boolean;
}

type ViewMode = 'list' | 'grid';
type SortBy = 'updated' | 'created' | 'title' | 'type';
type SortOrder = 'asc' | 'desc';
type FilterBy = 'all' | 'documents' | 'canvases' | 'favorites';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function DocumentationPanel({
  projectId,
  projectName,
  className,
  isMobile = false
}: DocumentationPanelProps) {
  const router = useRouter();
  const { user } = useUser();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Fetch documents and canvases with SWR
  const { data: documents = [], error: docsError, isLoading: docsLoading } = useSWR(
    user?.id ? `/api/projects/${projectId}/documents` : null,
    fetcher
  );

  const { data: canvases = [], error: canvasError, isLoading: canvasLoading } = useSWR(
    user?.id ? `/api/projects/${projectId}/canvases` : null,
    fetcher
  );

  // Combine and process items
  const allItems: ContentItem[] = useMemo(() => {
    const docs = ((documents as Document[]) || []).map((doc: Document) => ({
      ...doc,
      type: 'document' as const,
      wordCount: doc.contentText ? doc.contentText.split(/\s+/).length : 0
    }));

    const canv = ((canvases as Canvas[]) || []).map((canvas: Canvas) => ({
      ...canvas,
      type: 'canvas' as const,
      elementCount: canvas.elements?.length || 0
    }));

    return [...docs, ...canv];
  }, [documents, canvases]);

  // Filter and sort items
  const processedItems = useMemo(() => {
    let filtered = allItems;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.type === 'document' && item.contentText?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }

    // Apply type filter
    if (filterBy !== 'all') {
      if (filterBy === 'documents') {
        filtered = filtered.filter(item => item.type === 'document');
      } else if (filterBy === 'canvases') {
        filtered = filtered.filter(item => item.type === 'canvas');
      } else if (filterBy === 'favorites') {
        filtered = filtered.filter(item => item.isFavorite);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updated':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [allItems, searchTerm, filterBy, sortBy, sortOrder]);

  const isLoading = docsLoading || canvasLoading;
  const hasError = docsError || canvasError;

  // Action handlers
  const createNewDocument = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Document',
          contentText: '',
        }),
      });

      if (!response.ok) throw new Error('Failed to create document');

      const newDoc = await response.json() as { id: string };

      mutate(`/api/projects/${projectId}/documents`);
      router.push(`/project/${projectId}/document/${newDoc.id}`);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const createNewCanvas = async () => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/canvases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Canvas',
          elements: [],
          appState: {},
          files: {},
        }),
      });

      if (!response.ok) throw new Error('Failed to create canvas');

      const newCanvas = await response.json() as { id: string };

      mutate(`/api/projects/${projectId}/canvases`);
      router.push(`/project/${projectId}/canvas/${newCanvas.id}`);
    } catch (error) {
      console.error('Failed to create canvas:', error);
    }
  };

  const toggleFavorite = async (item: ContentItem) => {
    try {
      const endpoint = item.type === 'document'
        ? `/api/documents/${item.id}`
        : `/api/canvas/${item.id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isFavorite: !item.isFavorite,
        }),
      });

      if (!response.ok) throw new Error('Failed to update favorite');

      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const startEditing = (item: ContentItem) => {
    setEditingItem(item.id);
    setEditingTitle(item.title);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingTitle('');
  };

  const saveRename = async (item: ContentItem) => {
    if (!user?.id || !editingTitle.trim()) return;

    try {
      const endpoint = item.type === 'document'
        ? `/api/documents/${item.id}`
        : `/api/canvas/${item.id}`;

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingTitle.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to rename item');

      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);

      setEditingItem(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename item:', error);
    }
  };

  const handleItemClick = (item: ContentItem) => {
    if (editingItem === item.id || isSelectionMode) return;

    if (item.type === 'document') {
      router.push(`/project/${projectId}/document/${item.id}`);
    } else {
      router.push(`/project/${projectId}/canvas/${item.id}`);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  // Mobile responsive wrapper
  const PanelContent = () => (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Enhanced Header */}
      <div className="flex-shrink-0 border-b bg-card">
        <div className="p-4 space-y-4">
          {/* Title and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Folder className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground truncate">{projectName}</h1>
                <p className="text-sm text-muted-foreground">
                  {processedItems.length} {processedItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={createNewDocument} className="gap-2">
                  <FileText className="w-4 h-4" />
                  New Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={createNewCanvas} className="gap-2">
                  <CanvasIcon className="w-4 h-4" />
                  New Canvas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search documents and canvases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters and View Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="canvases">Canvases</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                </SelectContent>
              </Select>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    <span className="hidden sm:inline">Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setSortBy('updated')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Last Updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Date Created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('title')}>
                    <Type className="w-4 h-4 mr-2" />
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('type')}>
                    <Hash className="w-4 h-4 mr-2" />
                    Type
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? (
                      <>
                        <SortDesc className="w-4 h-4 mr-2" />
                        Descending
                      </>
                    ) : (
                      <>
                        <SortAsc className="w-4 h-4 mr-2" />
                        Ascending
                      </>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {hasError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">Failed to load content</h3>
              <p className="text-muted-foreground mb-4">There was an error loading your documents and canvases.</p>
              <Button onClick={() => {
                mutate(`/api/projects/${projectId}/documents`);
                mutate(`/api/projects/${projectId}/canvases`);
              }}>
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : processedItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                {searchTerm ? (
                  <Search className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <FileText className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm ? 'No results found' : 'No content yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first document or canvas to get started'
                }
              </p>
              {!searchTerm && (
                <div className="flex gap-3 justify-center">
                  <Button onClick={createNewDocument} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Document
                  </Button>
                  <Button onClick={createNewCanvas} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Canvas
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-2"
            )}>
              {processedItems.map((item) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  isEditing={editingItem === item.id}
                  editingTitle={editingTitle}
                  onEditingTitleChange={setEditingTitle}
                  onStartEditing={() => startEditing(item)}
                  onCancelEditing={cancelEditing}
                  onSaveRename={() => saveRename(item)}
                  onToggleFavorite={() => toggleFavorite(item)}
                  onClick={() => handleItemClick(item)}
                  onSplitView={() => {
                    const leftId = item.id;
                    const leftType = item.type;
                    const rightId = projectId;
                    const rightType = item.type === 'document' ? 'canvas' : 'document';
                    router.push(`/project/${projectId}/split?left=${leftId}&leftType=${leftType}&right=${rightId}&rightType=${rightType}`);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Return mobile sheet or desktop panel
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Menu className="w-4 h-4" />
            Docs
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-96 p-0">
          <PanelContent />
        </SheetContent>
      </Sheet>
    );
  }

  return <PanelContent />;
}

// Content Item Card Component
interface ContentItemCardProps {
  item: ContentItem;
  viewMode: ViewMode;
  isEditing: boolean;
  editingTitle: string;
  onEditingTitleChange: (title: string) => void;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveRename: () => void;
  onToggleFavorite: () => void;
  onClick: () => void;
  onSplitView: () => void;
}

function ContentItemCard({
  item,
  viewMode,
  isEditing,
  editingTitle,
  onEditingTitleChange,
  onStartEditing,
  onCancelEditing,
  onSaveRename,
  onToggleFavorite,
  onClick,
  onSplitView,
}: ContentItemCardProps) {
  const isDocument = item.type === 'document';

  if (viewMode === 'grid') {
    return (
      <div
        className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
        onClick={onClick}
      >
        {/* Favorite Star */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          {item.isFavorite ? (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>

        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
          isDocument
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
            : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
        )}>
          {isDocument ? (
            <FileText className="w-6 h-6" />
          ) : (
            <CanvasIcon className="w-6 h-6" />
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          {isEditing ? (
            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <Input
                value={editingTitle}
                onChange={(e) => onEditingTitleChange(e.target.value)}
                className="h-8 text-sm font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSaveRename();
                  } else if (e.key === 'Escape') {
                    onCancelEditing();
                  }
                }}
                autoFocus
              />
              <div className="flex gap-1">
                <Button size="sm" onClick={onSaveRename} className="h-6 px-2">
                  <Check className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={onCancelEditing} className="h-6 px-2">
                  <XIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</span>
              </div>
              {isDocument && item.contentText && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.contentText}
                </p>
              )}
              {!isDocument && (
                <p className="text-sm text-muted-foreground">
                  {item.elementCount || 0} elements
                </p>
              )}
            </>
          )}
        </div>

        {/* Actions */}
        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}>
                <Eye className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onStartEditing();
              }}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onSplitView();
              }}>
                <SplitSquareHorizontal className="w-4 h-4 mr-2" />
                Split View
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}>
                {item.isFavorite ? (
                  <>
                    <StarOff className="w-4 h-4 mr-2" />
                    Remove from Favorites
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4 mr-2" />
                    Add to Favorites
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className="group flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-all duration-200 cursor-pointer hover:border-primary/50"
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
        isDocument
          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          : "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
      )}>
        {isDocument ? (
          <FileText className="w-5 h-5" />
        ) : (
          <CanvasIcon className="w-5 h-5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Input
              value={editingTitle}
              onChange={(e) => onEditingTitleChange(e.target.value)}
              className="h-8 text-sm font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSaveRename();
                } else if (e.key === 'Escape') {
                  onCancelEditing();
                }
              }}
              autoFocus
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={onSaveRename}
              className="h-8 w-8 p-0"
            >
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              className="h-8 w-8 p-0"
            >
              <XIcon className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {item.title}
              </h3>
              {item.isFavorite && (
                <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
              )}
              <Badge variant="secondary" className="text-xs ml-auto">
                {item.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</span>
              {isDocument && item.wordCount && (
                <>
                  <span>•</span>
                  <span>{item.wordCount} words</span>
                </>
              )}
              {!isDocument && (
                <>
                  <span>•</span>
                  <span>{item.elementCount || 0} elements</span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="h-8 w-8 p-0"
          title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {item.isFavorite ? (
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onStartEditing();
          }}
          className="h-8 w-8 p-0"
          title="Rename"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onSplitView();
          }}
          className="h-8 w-8 p-0"
          title="Split View"
        >
          <SplitSquareHorizontal className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}>
              <Maximize2 className="w-4 h-4 mr-2" />
              Open Full Screen
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}