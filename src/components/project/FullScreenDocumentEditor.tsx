"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlateEditor } from '@/components/editor/plate-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit3, ArrowLeft, SplitSquareHorizontal, FileText } from 'lucide-react';

// Using simple PlateEditor component

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'document';
  createdAt: Date;
  updatedAt: Date;
}

interface FullScreenDocumentEditorProps {
  projectId: string;
  documentId: string;
  projectName: string;
}

export function FullScreenDocumentEditor({
  projectId,
  documentId,
  projectName,
}: FullScreenDocumentEditorProps) {
  const router = useRouter();
  // Mock document data - in real app, fetch from database
  const [document, setDocument] = useState<Document>({
    id: documentId,
    title: 'Project Overview',
    content: 'This document contains the main project information and requirements.\n\nGoals:\n- Create intuitive user interface\n- Implement real-time collaboration\n- Ensure scalable architecture',
    type: 'document',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  });

  const [isEditing, setIsEditing] = useState(true); // Start in edit mode for full screen
  const [editingTitle, setEditingTitle] = useState(document.title);

  const handleSave = () => {
    const updatedDoc = {
      ...document,
      title: editingTitle,
      content: 'Document content', // PlateEditor manages its own content
      updatedAt: new Date()
    };
    setDocument(updatedDoc);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditingTitle(document.title);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingTitle(document.title);
    setIsEditing(false);
  };

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
              {isEditing ? 'Editing Document' : 'Document'}
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
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white mx-auto max-w-4xl w-full shadow-sm">
        {/* Document Title */}
        <div className="p-6 border-b border-gray-200">
          {isEditing ? (
            <Input
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent"
              placeholder="Document title..."
            />
          ) : (
            <h1 className="text-2xl font-bold text-gray-900">{document.title}</h1>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Last updated: {document.updatedAt.toLocaleDateString()}
          </p>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-hidden p-6">
          <PlateEditor />
        </div>
      </div>
    </div>
  );
}