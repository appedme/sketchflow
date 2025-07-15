"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Plus,
  FileText,
  PencilRuler as CanvasIcon,
  Search,
  SplitSquareHorizontal,
  X,
  Edit2,
  Check,
  X as XIcon,
  MoreHorizontal,
  Calendar,
  Clock,
  Eye,
  Star,
  StarOff,
  Folder,
  Menu,
  ArrowUpDown,
  Hash,
  Type,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { mutate } from 'swr';
import { cn } from '@/lib/utils';
import { useApi } from '@/hooks/useApi';

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

type SortBy = 'updated' | 'created' | 'title' | 'type';
type SortOrder = 'asc' | 'desc';
type FilterBy = 'all' | 'documents' | 'canvases' | 'favorites';

export function DocumentationPanel({
  projectId,
  projectName,
  className,
  isMobile = false
}: DocumentationPanelProps) {
  const router = useRouter();

  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  // Fetch documents and canvases with SWR
  const { data: documents = [], error: docsError, isLoading: docsLoading } = useApi<Document[]>(
    `/api/projects/${projectId}/documents`
  );

  const { data: canvases = [], error: canvasError, isLoading: canvasLoading } = useApi<Canvas[]>(
    `/api/projects/${projectId}/canvases`
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
    if (!editingTitle.trim()) return;

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
    if (editingItem === item.id) return;

    if (item.type === 'document') {
      router.push(`/project/${projectId}/document/${item.id}`);
    } else {
      router.push(`/project/${projectId}/canvas/${item.id}`);
    }
  };

  // Panel content
  const PanelContent = () => (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-card p-4 space-y-4">
        {/* Title and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Folder className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-foreground truncate">{projectName}</h1>
              <p className="text-sm text-muted-foreground">
                {processedItems.length} {processedItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="gap-2 flex-shrink-0">
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

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
            <SelectTrigger className="w-32 flex-shrink-0">
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
              <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
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
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
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
            <div className="space-y-2">
              {processedItems.map((item) => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  isEditing={editingItem === item.id}
                  editingTitle={editingTitle}
                  onEditingTitleChange={setEditingTitle}
                  onStartEditing={() => startEditing(item)}
                  onCancelEditing={cancelEditing}
                  onSaveRename={() => saveRename(item)}
                  onToggleFavorite={() => toggleFavorite(item)}
                  onClick={() => handleItemClick(item)}
                  onSplitView={() => {
                    router.push(`/project/${projectId}/split?left=${item.id}&leftType=${item.type}&right=${projectId}&rightType=${item.type === 'document' ? 'canvas' : 'document'}`);
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

// Content Item Card Component (List view only)
interface ContentItemCardProps {
  item: ContentItem;
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
              className="h-8 w-8 p-0 flex-shrink-0"
            >
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEditing}
              className="h-8 w-8 p-0 flex-shrink-0"
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
              <Badge variant="secondary" className="text-xs ml-auto flex-shrink-0">
                {item.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="truncate">{formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}</span>
              {isDocument && item.wordCount && (
                <>
                  <span>•</span>
                  <span className="flex-shrink-0">{item.wordCount} words</span>
                </>
              )}
              {!isDocument && (
                <>
                  <span>•</span>
                  <span className="flex-shrink-0">{item.elementCount || 0} elements</span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
              <Eye className="w-4 h-4 mr-2" />
              Open
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