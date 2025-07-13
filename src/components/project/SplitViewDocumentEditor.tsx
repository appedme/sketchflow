"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { PlateEditor } from '@/components/editor/plate-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit3, FileText } from 'lucide-react';

interface Document {
  id: string;
  title: string;
  content: string;
  type: 'document';
  createdAt: Date;
  updatedAt: Date;
}

interface SplitViewDocumentEditorProps {
  documentId: string;
}

// Simple default value for new documents
const getDefaultValue = (content: string): any[] => {
  if (!content.trim()) {
    return [
      {
        type: 'p',
        children: [{ text: '' }],
      }
    ];
  }
  
  // Simple text to paragraph conversion
  return [
    {
      type: 'p',
      children: [{ text: content }],
    }
  ];
};

// Convert Plate value back to text
const plateValueToText = (value: any[]): string => {
  return value.map((node: any) => {
    const text = node.children?.map((child: any) => child.text || '').join('') || '';
    return text;
  }).join('\n\n');
};

export function SplitViewDocumentEditor({ documentId }: SplitViewDocumentEditorProps) {
  // Mock document data - in real app, fetch from database
  const [document, setDocument] = useState<Document>({
    id: documentId,
    title: 'Project Overview',
    content: 'This document contains the main project information and requirements.\n\nGoals:\n- Create intuitive user interface\n- Implement real-time collaboration\n- Ensure scalable architecture',
    type: 'document',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(document.title);
  const [editorValue, setEditorValue] = useState<any[]>(() => getDefaultValue(document.content));

  const handleEditorChange = (value: any[]) => {
    setEditorValue(value);
  };

  const handleSave = () => {
    const text = plateValueToText(editorValue);
    const updatedDoc = {
      ...document,
      title: editingTitle,
      content: text,
      updatedAt: new Date()
    };
    setDocument(updatedDoc);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditingTitle(document.title);
    setEditorValue(getDefaultValue(document.content));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingTitle(document.title);
    setEditorValue(getDefaultValue(document.content));
    setIsEditing(false);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">
            {isEditing ? 'Editing' : 'Document'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="gap-2"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </Button>
          )}
          {isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                className="gap-1 text-xs"
              >
                <Save className="w-3 h-3" />
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Document Title */}
      <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
        {isEditing ? (
          <Input
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="font-semibold border-none shadow-none p-0 h-auto bg-transparent text-sm"
            placeholder="Document title..."
          />
        ) : (
          <h2 className="font-semibold text-gray-900 text-sm">{document.title}</h2>
        )}
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden p-4">
        <PlateEditor 
          value={editorValue}
          onChange={isEditing ? handleEditorChange : undefined}
          placeholder={isEditing ? "Start writing..." : undefined}
          readOnly={!isEditing}
        />
      </div>
    </div>
  );
}