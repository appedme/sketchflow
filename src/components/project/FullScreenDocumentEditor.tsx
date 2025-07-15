"use client";

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, PanelLeftOpen, SplitSquareHorizontal, FileText } from 'lucide-react';
import { DocumentProvider, useDocument } from '@/contexts/DocumentContext';
import { DocumentationPanel } from './DocumentationPanel';

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
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [manualSaving, setManualSaving] = useState(false);
  const {
    document,
    isLoading,
    title,
    content,
    saving,
    setTitle,
    setContent,
    saveDocument
  } = useDocument();

  const handleSave = async () => {
    setManualSaving(true);
    try {
      await saveDocument();
      setTimeout(() => setManualSaving(false), 1000);
    } catch (error) {
      console.error('Save failed:', error);
      setManualSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="h-12 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDocumentPanel(!showDocumentPanel)}
            className="gap-2"
          >
            <PanelLeftOpen className="w-4 h-4" />
            Docs
          </Button>
          <FileText className="w-4 h-4 text-blue-600 ml-2" />
          <span className="font-semibold text-lg text-gray-900">Document Editor</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/project/${projectId}/split?left=${document?.id}&leftType=document&right=${projectId}&rightType=canvas`)}
            className="gap-2"
          >
            <SplitSquareHorizontal className="w-4 h-4" />
            Split View
          </Button>
          <Button 
            size="sm" 
            className="gap-2" 
            onClick={handleSave} 
            disabled={manualSaving || saving}
          >
            <Save className="w-4 h-4" />
            {manualSaving || saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Documentation Panel */}
        {showDocumentPanel && (
          <div className="w-1/3 bg-white border-r border-gray-200 shadow-lg z-20 flex flex-col overflow-hidden">
            <DocumentationPanel
              projectId={projectId}
              projectName={projectName}
            />
          </div>
        )}
        
        {/* Document Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white mx-auto max-w-4xl w-full">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></span>
            <span className="text-gray-500 ml-2">Loading...</span>
          </div>
        ) : document ? (
          <>
            {/* Document Title */}
            <div className="p-6 border-b">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent focus:ring-0"
                placeholder="Document title..."
              />
              <span className="text-xs text-gray-400 mt-1 block">
                Last updated: {new Date(document.updatedAt).toLocaleDateString()}
                {saving && <span className="ml-2">Saving...</span>}
              </span>
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden p-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full resize-none border-none outline-none bg-transparent text-gray-900 leading-relaxed focus:ring-0"
                placeholder="Start writing..."
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <FileText className="w-12 h-12 text-gray-300 mb-4" />
            <span className="text-gray-500 ml-2">Document not found</span>
          </div>
        )}
        </div>
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
