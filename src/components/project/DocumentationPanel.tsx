"use client";

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  FileText,
  PencilRuler as CanvasIcon,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  FolderOpen,
  SplitSquareHorizontal,
  X,
  Save,
  Eye,
  EyeOff,
  Maximize2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'document';
  createdAt: Date;
  updatedAt: Date;
}

interface Canvas {
  id: string;
  title: string;
  type: 'canvas';
  elements: any[];
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
}

interface DocumentationPanelProps {
  projectId: string;
  onSplitView: (itemId: string, itemType: 'document' | 'canvas') => void;
  onFullScreen: (itemId: string, itemType: 'document' | 'canvas') => void;
  onClosePanel: () => void;
  selectedItemId?: string;
}

export function DocumentationPanel({
  projectId,
  onSplitView,
  onFullScreen,
  onClosePanel,
  selectedItemId
}: DocumentationPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Project Overview',
      content: '# Project Overview\n\nThis document contains the main project information and requirements.\n\n## Goals\n- Create intuitive user interface\n- Implement real-time collaboration\n- Ensure scalable architecture',
      type: 'document',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '2',
      title: 'Technical Requirements',
      content: '# Technical Requirements\n\n## Frontend\n- React 18+\n- TypeScript\n- Tailwind CSS\n\n## Backend\n- Node.js\n- PostgreSQL\n- Redis for caching',
      type: 'document',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-18')
    }
  ]);

  const [canvases, setCanvases] = useState<Canvas[]>([
    {
      id: 'canvas-1',
      title: 'System Architecture',
      type: 'canvas',
      elements: [],
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-19')
    },
    {
      id: 'canvas-2',
      title: 'User Flow Diagram',
      type: 'canvas',
      elements: [],
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-21')
    }
  ]);

  // Mock data for documents and canvases
  const mockDocuments = documents;
  const mockCanvases = canvases;

  const [selectedItem, setSelectedItem] = useState<Document | Canvas | null>(() => {
    if (selectedItemId) {
      const foundDoc = mockDocuments.find(doc => doc.id === selectedItemId);
      const foundCanvas = mockCanvases.find(canvas => canvas.id === selectedItemId);
      return foundDoc || foundCanvas || null;
    }
    return documents[0] || null;
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'documents' | 'canvases'>('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingContent, setEditingContent] = useState('');

  const allItems = [...documents, ...canvases].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const filteredItems = allItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'documents' && item.type === 'document') ||
      (activeTab === 'canvases' && item.type === 'canvas');
    return matchesSearch && matchesTab;
  });

  const createNewDocument = useCallback(() => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: 'Untitled Document',
      content: '# New Document\n\nStart writing your content here...',
      type: 'document',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setDocuments(prev => [newDoc, ...prev]);
    setSelectedItem(newDoc);
    setIsEditing(true);
    setEditingTitle(newDoc.title);
    setEditingContent(newDoc.content);
  }, []);

  const createNewCanvas = useCallback(() => {
    const newCanvas: Canvas = {
      id: `canvas-${Date.now()}`,
      title: 'Untitled Canvas',
      type: 'canvas',
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCanvases(prev => [newCanvas, ...prev]);
    setSelectedItem(newCanvas);
  }, []);

  const deleteItem = useCallback((itemId: string, itemType: 'document' | 'canvas') => {
    if (itemType === 'document') {
      setDocuments(prev => prev.filter(doc => doc.id !== itemId));
    } else {
      setCanvases(prev => prev.filter(canvas => canvas.id !== itemId));
    }

    if (selectedItem?.id === itemId) {
      setSelectedItem(allItems.find(item => item.id !== itemId) || null);
    }
  }, [selectedItem, allItems]);

  const duplicateItem = useCallback((item: Document | Canvas) => {
    if (item.type === 'document') {
      const newDoc: Document = {
        ...item,
        id: `doc-${Date.now()}`,
        title: `${item.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setDocuments(prev => [newDoc, ...prev]);
    } else {
      const newCanvas: Canvas = {
        ...item,
        id: `canvas-${Date.now()}`,
        title: `${item.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCanvases(prev => [newCanvas, ...prev]);
    }
  }, []);

  const saveDocument = useCallback(() => {
    if (selectedItem && selectedItem.type === 'document') {
      const updatedDoc: Document = {
        ...selectedItem,
        title: editingTitle,
        content: editingContent,
        updatedAt: new Date()
      };

      setDocuments(prev => prev.map(doc =>
        doc.id === selectedItem.id ? updatedDoc : doc
      ));
      setSelectedItem(updatedDoc);
      setIsEditing(false);
    }
  }, [selectedItem, editingTitle, editingContent]);

  const startEditing = useCallback(() => {
    if (selectedItem && selectedItem.type === 'document') {
      setEditingTitle(selectedItem.title);
      setEditingContent(selectedItem.content);
      setIsEditing(true);
    }
  }, [selectedItem]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      {/* <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Documentation</h2>
            <p className="text-xs text-gray-600">{allItems.length} items</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewDocument}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Doc
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={createNewCanvas}
            className="gap-2"
          >
            <CanvasIcon className="w-4 h-4" />
            Canvas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClosePanel}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div> */}

      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Search and Tabs */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search documents and canvases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                <TabsTrigger value="documents" className="text-xs">Docs</TabsTrigger>
                <TabsTrigger value="canvases" className="text-xs">Canvas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No items found</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search or create a new item</p>
              </div>
            ) : (
              <div className="p-2">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group p-3 rounded-lg cursor-pointer mb-2 transition-all duration-200 ${selectedItem?.id === item.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'document'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-purple-100 text-purple-600'
                          }`}>
                          {item.type === 'document' ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <CanvasIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-gray-900 truncate">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(item.updatedAt)}
                          </p>
                          {item.type === 'document' && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                              {(item as Document).content.substring(0, 60)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onFullScreen(item.id, item.type);
                          }}
                          className="w-6 h-6 p-0"
                          title="Open in full screen"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSplitView(item.id, item.type);
                          }}
                          className="w-6 h-6 p-0"
                          title="Open in split view"
                        >
                          <SplitSquareHorizontal className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            duplicateItem(item);
                          }}
                          className="w-6 h-6 p-0"
                          title="Duplicate"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this item?')) {
                              deleteItem(item.id, item.type);
                            }
                          }}
                          className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedItem ? (
            <>
              {/* Content Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedItem.type === 'document'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-purple-100 text-purple-600'
                    }`}>
                    {selectedItem.type === 'document' ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <CanvasIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h1 className="font-semibold text-lg text-gray-900">
                      {isEditing ? (
                        <Input
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          className="font-semibold text-lg border-none shadow-none p-0 h-auto"
                        />
                      ) : (
                        selectedItem.title
                      )}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Updated {formatDate(selectedItem.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedItem.type === 'document' && (
                    <>
                      {isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={saveDocument}
                            className="gap-2"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={startEditing}
                          className="gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit
                        </Button>
                      )}
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFullScreen(selectedItem.id, selectedItem.type)}
                    className="gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Full Screen
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSplitView(selectedItem.id, selectedItem.type)}
                    className="gap-2"
                  >
                    <SplitSquareHorizontal className="w-4 h-4" />
                    Split View
                  </Button>
                </div>
              </div>

              {/* Content Body */}
              <div className="flex-1 p-4 overflow-y-auto">
                {selectedItem.type === 'document' ? (
                  isEditing ? (
                    <Textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full h-full resize-none border-none shadow-none p-0 font-mono text-sm"
                      placeholder="Write your document content here..."
                    />
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                        {(selectedItem as Document).content}
                      </pre>
                    </div>
                  )
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <CanvasIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="font-medium text-gray-900 mb-2">Canvas Preview</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        This canvas contains {(selectedItem as Canvas).elements.length} elements
                      </p>
                      <div className="flex gap-2 justify-center">
                        <Button
                          onClick={() => onFullScreen(selectedItem.id, selectedItem.type)}
                          variant="outline"
                          className="gap-2"
                        >
                          <Maximize2 className="w-4 h-4" />
                          Full Screen
                        </Button>
                        <Button
                          onClick={() => onSplitView(selectedItem.id, selectedItem.type)}
                          className="gap-2"
                        >
                          <SplitSquareHorizontal className="w-4 h-4" />
                          Split View
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium text-gray-900 mb-2">No item selected</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select a document or canvas from the sidebar to view its content
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={createNewDocument} variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    New Document
                  </Button>
                  <Button onClick={createNewCanvas} className="gap-2">
                    <CanvasIcon className="w-4 h-4" />
                    New Canvas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}