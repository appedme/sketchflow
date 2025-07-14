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
  Maximize2
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
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projectName}</h1>
            <p className="text-gray-500 mt-1">Project documentation and canvases</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={createNewDocument} className="gap-2">
              <Plus className="w-4 h-4" />
              New Document
            </Button>
            <Button onClick={createNewCanvas} variant="outline" className="gap-2">
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
      <div className="flex-1 overflow-y-auto p-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => {
                  if (item.type === 'document') {
                    router.push(`/project/${projectId}/document/${item.id}`);
                  } else {
                    router.push(`/project/${projectId}/canvas/${item.id}`);
                  }
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {item.type === 'document' ? (
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CanvasIcon className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {item.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                    >
                      <SplitSquareHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  {item.type === 'document' ? (
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.contentText || 'No content'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      {item.elements?.length || 0} elements
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    Updated {formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true })}
                  </span>
                  <span className="capitalize">
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}