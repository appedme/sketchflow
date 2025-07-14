"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Folder, Search } from 'lucide-react';
import { getDocuments, createDocument, updateDocument } from '@/lib/actions/documents';
import { useDebounce } from '@/hooks/use-debounce';

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'document';
  createdAt: string;
  updatedAt: string;
}

interface DocumentPanelProps {
  projectId: string;
}

export function DocumentPanel({ projectId }: DocumentPanelProps) {
  const { user } = useUser();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Debounce document updates
  const debouncedTitle = useDebounce(selectedDoc?.title || '', 1000);
  const debouncedContent = useDebounce(selectedDoc?.content || '', 2000);

  // Load documents from backend
  useEffect(() => {
    const loadDocuments = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const docsData = await getDocuments(projectId, user.id);
        const transformedDocs: Document[] = docsData.map(doc => ({
          id: doc.id,
          title: doc.title,
          content: doc.contentText || '',
          type: 'document' as const,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        }));
        setDocuments(transformedDocs);
        if (transformedDocs.length > 0 && !selectedDoc) {
          setSelectedDoc(transformedDocs[0]);
        }
      } catch (error) {
        console.error('Failed to load documents:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [projectId, user?.id]);

  // Auto-save document changes
  useEffect(() => {
    if (selectedDoc && (debouncedTitle || debouncedContent)) {
      const saveDocument = async () => {
        try {
          setSaving(true);
          await updateDocument(selectedDoc.id, selectedDoc.content, selectedDoc.title);
        } catch (error) {
          console.error('Failed to save document:', error);
        } finally {
          setSaving(false);
        }
      };
      
      saveDocument();
    }
  }, [debouncedTitle, debouncedContent, selectedDoc]);

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDocument = async () => {
    try {
      const newDoc = await createDocument(projectId, 'New Document');
      const transformedDoc: Document = {
        id: newDoc.id,
        title: newDoc.title,
        content: newDoc.contentText || '',
        type: 'document',
        createdAt: newDoc.createdAt,
        updatedAt: newDoc.updatedAt,
      };
      setDocuments(prev => [transformedDoc, ...prev]);
      setSelectedDoc(transformedDoc);
    } catch (error) {
      console.error('Failed to create document:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Document Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Documents</h2>
          <Button size="sm" onClick={handleCreateDocument} className="gap-2">
            <Plus className="w-4 h-4" />
            New Doc
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Document List */}
      <div className="flex-1 flex">
        {/* Sidebar with document list */}
        <div className="w-1/3 border-r border-gray-200 bg-gray-50">
          <div className="p-2">
            {loading ? (
              <div className="p-3 text-center text-gray-500">Loading documents...</div>
            ) : filteredDocs.length === 0 ? (
              <div className="p-3 text-center text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No documents yet</p>
                <p className="text-xs">Create your first document</p>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`p-3 rounded-lg cursor-pointer mb-1 flex items-center gap-2 ${
                    selectedDoc?.id === doc.id 
                      ? 'bg-blue-100 border border-blue-200' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <FileText className="w-4 h-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{doc.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {doc.content.substring(0, 30)}...
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Document Editor */}
        <div className="flex-1 p-4">
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Input
                  value={selectedDoc.title}
                  onChange={(e) => {
                    const updatedDocs = documents.map(doc =>
                      doc.id === selectedDoc.id ? { ...doc, title: e.target.value } : doc
                    );
                    setDocuments(updatedDocs);
                    setSelectedDoc({ ...selectedDoc, title: e.target.value });
                  }}
                  className="font-semibold text-lg border-none shadow-none p-0 flex-1"
                  placeholder="Document title..."
                />
                {saving && (
                  <div className="text-xs text-gray-500 ml-2">Saving...</div>
                )}
              </div>
              
              <Textarea
                value={selectedDoc.content}
                onChange={(e) => {
                  const updatedDocs = documents.map(doc =>
                    doc.id === selectedDoc.id ? { ...doc, content: e.target.value } : doc
                  );
                  setDocuments(updatedDocs);
                  setSelectedDoc({ ...selectedDoc, content: e.target.value });
                }}
                className="flex-1 resize-none border-none shadow-none p-0"
                placeholder="Start writing your document..."
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a document to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}