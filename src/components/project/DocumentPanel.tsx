"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Folder, Search, Save } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import useSWR, { mutate } from 'swr';

interface Document {
  id: string;
  title: string;
  contentText: string;
  type: 'document';
  createdAt: string;
  updatedAt: string;
}

interface DocumentPanelProps {
  projectId: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export function DocumentPanel({ projectId }: DocumentPanelProps) {
  const user = useUser();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');

  // Fetch documents with SWR
  const { data: documents = [], error, isLoading } = useSWR(
    user?.id ? `/api/projects/${projectId}/documents` : null,
    fetcher
  );

  // Debounce document updates
  const debouncedTitle = useDebounce(localTitle, 1000);
  const debouncedContent = useDebounce(localContent, 2000);

  // Initialize local state when document is selected
  useEffect(() => {
    if (selectedDoc) {
      setLocalTitle(selectedDoc.title);
      setLocalContent(selectedDoc.contentText || '');
    }
  }, [selectedDoc]);

  // Auto-save document changes
  useEffect(() => {
    if (!selectedDoc || !user?.id) return;
    if (debouncedTitle === selectedDoc.title && debouncedContent === selectedDoc.contentText) return;

    const saveDocument = async () => {
      try {
        setSaving(true);
        const response = await fetch(`/api/documents/${selectedDoc.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: debouncedTitle,
            contentText: debouncedContent,
          }),
        });

        if (!response.ok) throw new Error('Failed to save');

        // Update the cache
        mutate(`/api/projects/${projectId}/documents`);

      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        setSaving(false);
      }
    };

    saveDocument();
  }, [debouncedTitle, debouncedContent, selectedDoc, user?.id, projectId]);

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

      // Select the new document
      setSelectedDoc(newDoc as Document);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  const filteredDocuments = ((documents as Document[]) || []).filter((doc: Document) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (doc.contentText && doc.contentText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">Failed to load documents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Document List */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Documents
            </h2>
            <Button
              onClick={createNewDocument}
              size="sm"
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              New
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              Loading documents...
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No documents found' : 'No documents yet'}
            </div>
          ) : (
            <div className="p-2">
              {filteredDocuments.map((doc: Document) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${selectedDoc?.id === doc.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'bg-white hover:bg-gray-50 border border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {doc.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {doc.contentText || 'No content'}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(doc.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedDoc ? (
          <>
            {/* Editor Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="text-xl font-semibold border-none shadow-none p-0 h-auto bg-transparent"
                  placeholder="Document title..."
                />
                {saving && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Save className="w-4 h-4 animate-spin" />
                    Saving...
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(selectedDoc.updatedAt).toLocaleDateString()}
              </p>
            </div>

            {/* Editor Content */}
            <div className="flex-1 p-4">
              <Textarea
                value={localContent}
                onChange={(e) => setLocalContent(e.target.value)}
                placeholder="Start writing your document..."
                className="w-full h-full resize-none border-none shadow-none bg-transparent text-gray-900 leading-relaxed"
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No document selected
              </h3>
              <p className="text-gray-500">
                Select a document from the list or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}