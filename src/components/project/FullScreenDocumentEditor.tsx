"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, ArrowLeft, SplitSquareHorizontal, FileText } from 'lucide-react';
import { DocumentProvider, useDocument } from '@/contexts/DocumentContext';

interface FullScreenDocumentEditorProps {
  projectId: string;
  documentId: string;
  projectName: string;
}

function DocumentEditorContent({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const router = useRouter();
  const { 
    document, 
    isLoading, 
    title, 
    content, 
    saving, 
    setTitle, 
    setContent 
  } = useDocument();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/project/${projectId}`)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <h1 className="font-semibold text-lg text-gray-900">
              Document Editor
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${projectId}/split?left=${documentId}&leftType=document&right=${projectId}&rightType=canvas`)}
            className="gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Split View
          </Button>
          {saving && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Save className="w-4 h-4 animate-spin" />
              Saving...
            </div>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white mx-auto max-w-4xl w-full shadow-sm">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading document...</p>
            </div>
          </div>
        ) : document ? (
          <>
            {/* Document Title */}
            <div className="p-6 border-b border-gray-200">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent focus:ring-0 focus:border-none"
                placeholder="Document title..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(document.updatedAt).toLocaleDateString()}
                {saving && <span className="ml-2">- Saving...</span>}
              </p>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full resize-none border-none outline-none bg-transparent text-gray-900 leading-relaxed focus:ring-0"
                placeholder="Start writing your document..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Document not found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function FullScreenDocumentEditor({
  projectId,
  documentId,
  projectName,
}: FullScreenDocumentEditorProps) {
  return (
    <DocumentProvider documentId={documentId}>
      <DocumentEditorContent projectId={projectId} projectName={projectName} />
    </DocumentProvider>
  );
}