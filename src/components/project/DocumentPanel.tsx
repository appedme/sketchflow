"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, FileText, Folder, Search } from 'lucide-react';

interface DocumentPanelProps {
  projectId: string;
}

export function DocumentPanel({ projectId }: DocumentPanelProps) {
  const [documents, setDocuments] = useState([
    { id: '1', title: 'Project Overview', type: 'document', content: 'This is the main project document...' },
    { id: '2', title: 'Requirements', type: 'document', content: 'List of requirements...' },
    { id: '3', title: 'Notes', type: 'document', content: 'Quick notes and ideas...' }
  ]);
  
  const [selectedDoc, setSelectedDoc] = useState(documents[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Document Panel Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Documents</h2>
          <Button size="sm" className="gap-2">
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
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`p-3 rounded-lg cursor-pointer mb-1 flex items-center gap-2 ${
                  selectedDoc.id === doc.id 
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
            ))}
          </div>
        </div>

        {/* Document Editor */}
        <div className="flex-1 p-4">
          {selectedDoc ? (
            <div className="h-full flex flex-col">
              <Input
                value={selectedDoc.title}
                onChange={(e) => {
                  const updatedDocs = documents.map(doc =>
                    doc.id === selectedDoc.id ? { ...doc, title: e.target.value } : doc
                  );
                  setDocuments(updatedDocs);
                  setSelectedDoc({ ...selectedDoc, title: e.target.value });
                }}
                className="mb-4 font-semibold text-lg border-none shadow-none p-0"
                placeholder="Document title..."
              />
              
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