"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

export function DocumentationPanel({
  projectId,
  onSplitView,
  onFullScreen,
  onClosePanel,
}: DocumentationPanelProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Project Overview',
      content: 'This is the main project document with detailed information about the project scope, objectives, and requirements.',
      type: 'document',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    },
    {
      id: '2',
      title: 'Technical Requirements',
      content: 'Detailed technical specifications and requirements for the project implementation.',
      type: 'document',
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-18'),
    },
    {
      id: '3',
      title: 'Meeting Notes',
      content: 'Notes from project meetings and discussions with stakeholders.',
      type: 'document',
      createdAt: new Date('2024-01-17'),
      updatedAt: new Date('2024-01-19'),
    },
  ]);

  const [canvases, setCanvases] = useState<Canvas[]>([
    {
      id: 'canvas-1',
      title: 'System Architecture',
      type: 'canvas',
      elements: [],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
    },
    {
      id: 'canvas-2',
      title: 'User Flow Diagram',
      type: 'canvas',
      elements: [],
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-18'),
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Document | Canvas | null>(null);

  // Filter items based on search
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCanvases = canvases.filter(canvas =>
    canvas.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = () => {
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: 'New Document',
      content: 'Start writing your document...',
      type: 'document',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setDocuments(prev => [newDoc, ...prev]);
    // Navigate to new document in full screen
    router.push(`/project/${projectId}/document/${newDoc.id}`);
  };

  const handleSplitView = (item: Document | Canvas) => {
    const itemType = item.type;
    const route = `/project/${projectId}/split?left=${item.id}&leftType=${itemType}&right=${projectId}&rightType=canvas`;
    router.push(route);
  };

  const handleFullScreen = (item: Document | Canvas) => {
    if (item.type === 'document') {
      router.push(`/project/${projectId}/document/${item.id}`);
    } else {
      router.push(`/project/${projectId}/canvas/${item.id}`);
    }
  };

  const handleItemClick = (item: Document | Canvas) => {
    setSelectedItem(item);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Documents & Canvas</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleCreateDocument} className="gap-2">
            <Plus className="w-4 h-4" />
            New Doc
          </Button>
          <Button variant="ghost" size="sm" onClick={onClosePanel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents and canvas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Items List */}
        <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
          {/* Documents Section */}
          {filteredDocuments.length > 0 && (
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Documents</h3>
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleItemClick(doc)}
                  className={`p-3 rounded-lg cursor-pointer mb-2 border ${
                    selectedItem?.id === doc.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{doc.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Canvas Section */}
          {filteredCanvases.length > 0 && (
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Canvas</h3>
              {filteredCanvases.map((canvas) => (
                <div
                  key={canvas.id}
                  onClick={() => handleItemClick(canvas)}
                  className={`p-3 rounded-lg cursor-pointer mb-2 border ${
                    selectedItem?.id === canvas.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CanvasIcon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{canvas.title}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(canvas.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview & Actions */}
        <div className="flex-1 flex flex-col">
          {selectedItem ? (
            <>
              {/* Preview */}
              <div className="flex-1 p-4">
                <h3 className="font-semibold text-lg mb-2">{selectedItem.title}</h3>
                {selectedItem.type === 'document' ? (
                  <div className="text-sm text-gray-600 leading-relaxed">
                    {(selectedItem as Document).content.substring(0, 200)}...
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                    <CanvasIcon className="w-8 h-8 text-gray-400" />
                    <span className="ml-2 text-gray-500">Canvas Preview</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleSplitView(selectedItem)}
                    className="flex-1 gap-2"
                  >
                    <SplitSquareHorizontal className="w-4 h-4" />
                    Split View
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleFullScreen(selectedItem)}
                    className="flex-1 gap-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    Full Screen
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select an item to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}