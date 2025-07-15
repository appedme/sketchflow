"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  X as XIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useSWR, { mutate } from 'swr';

interface Document {
  id: string;
  title: string;
  contentText: string;
  type: 'document';
  createdAt: string;
  updatedAt: string;
}

interface Canvas {
  id: string;
  title: string;
  elements: any[];
  type: 'canvas';
  createdAt: string;
  updatedAt: string;
}

interface DocumentationPanelProps {
  projectId: string;
  projectName: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function DocumentationPanel({ projectId, projectName }: DocumentationPanelProps) {
  const router = useRouter();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // Fetch documents and canvases with SWR
  const { data: documents = [], error: docsError } = useSWR(
    user?.id ? `/api/projects/${projectId}/documents` : null,
    fetcher
  );

  const { data: canvases = [], error: canvasError } = useSWR(
    user?.id ? `/api/projects/${projectId}/canvases` : null,
    fetcher
  );

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

      const newDoc = await response.json();
      
      // Update the cache
      mutate(`/api/projects/${projectId}/documents`);
      
      // Navigate to the new document
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

      const newCanvas = await response.json();
      
      // Update the cache
      mutate(`/api/projects/${projectId}/canvases`);
      
      // Navigate to the new canvas
      router.push(`/project/${projectId}/canvas/${newCanvas.id}`);
    } catch (error) {
      console.error('Failed to create canvas:', error);
    }
  };

  const startEditing = (item: any) => {
    setEditingItem(item.id);
    setEditingTitle(item.title);
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditingTitle('');
  };

  const saveRename = async (item: any) => {
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

      // Update the cache
      mutate(`/api/projects/${projectId}/documents`);
      mutate(`/api/projects/${projectId}/canvases`);
      
      setEditingItem(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename item:', error);
    }
  };

  // Combine and filter items
  const allItems = [
    ...documents.map((doc: Document) => ({ ...doc, type: 'document' as const })),
    ...canvases.map((canvas: Canvas) => ({ ...canvas, type: 'canvas' as const }))
  ];

  const filteredItems = allItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.type === 'document' && item.contentText?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isLoading = !documents && !canvases && !docsError && !canvasError;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">{projectName}</h1>
          <div className="flex gap-2">
            <Button onClick={createNewDocument} size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
            <Button onClick={createNewCanvas} size="sm" variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              New Canvas
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents and canvases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading content...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No results found' : 'No content yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm 
                ? 'Try adjusting your search terms'
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
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => {
                  if (editingItem === item.id) return; // Don't navigate when editing
                  if (item.type === 'document') {
                    router.push(`/project/${projectId}/document/${item.id}`);
                  } else {
                    router.push(`/project/${projectId}/canvas/${item.id}`);
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.type === 'document' ? (
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CanvasIcon className="w-4 h-4 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="h-6 text-sm font-medium"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveRename(item);
                              } else if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              saveRename(item);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="w-3 h-3 text-green-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              cancelEditing();
                            }}
                            className="h-6 w-6 p-0"
                          >
                            <XIcon className="w-3 h-3 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                          {item.title}
                        </h3>
                      )}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="capitalize">{item.type}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                        </span>
                        {item.type === 'document' && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-xs">
                              {item.contentText || 'No content'}
                            </span>
                          </>
                        )}
                        {item.type === 'canvas' && (
                          <>
                            <span>•</span>
                            <span>{item.elements?.length || 0} elements</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(item);
                      }}
                      className="h-8 w-8 p-0"
                      title="Rename"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (item.type === 'document') {
                          router.push(`/project/${projectId}/document/${item.id}`);
                        } else {
                          router.push(`/project/${projectId}/canvas/${item.id}`);
                        }
                      }}
                      className="h-8 w-8 p-0"
                      title="Open"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        const leftId = item.id;
                        const leftType = item.type;
                        const rightId = projectId;
                        const rightType = item.type === 'document' ? 'canvas' : 'document';
                        router.push(`/project/${projectId}/split?left=${leftId}&leftType=${leftType}&right=${rightId}&rightType=${rightType}`);
                      }}
                      className="h-8 w-8 p-0"
                      title="Split View"
                    >
                      <SplitSquareHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}