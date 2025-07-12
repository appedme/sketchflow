"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Plate, usePlateEditor, type Value } from 'platejs/react';
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { AutoformatKit } from '@/components/editor/plugins/autoformat-kit';
import { ExitBreakKit } from '@/components/editor/plugins/exit-break-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { FloatingToolbarKit } from '@/components/editor/plugins/floating-toolbar-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Save, Edit3, FileText } from 'lucide-react';

// Simplified plugin set for split view document editing
const SplitViewDocumentEditorKit = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  ...LinkKit,
  ...ListKit,
  ...AutoformatKit,
  ...ExitBreakKit,
  ...MarkdownKit,
  ...FloatingToolbarKit,
];

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

// Convert markdown content to Plate value
const markdownToPlateValue = (markdown: string): Value => {
  const lines = markdown.split('\n');
  const value: Value = [];
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      value.push({
        type: 'h1',
        children: [{ text: line.slice(2) }],
      });
    } else if (line.startsWith('## ')) {
      value.push({
        type: 'h2',
        children: [{ text: line.slice(3) }],
      });
    } else if (line.startsWith('### ')) {
      value.push({
        type: 'h3',
        children: [{ text: line.slice(4) }],
      });
    } else if (line.trim() === '') {
      continue;
    } else {
      value.push({
        type: 'p',
        children: [{ text: line }],
      });
    }
  }
  
  if (value.length === 0) {
    value.push({
      type: 'p',
      children: [{ text: '' }],
    });
  }
  
  return value;
};

// Convert Plate value back to markdown
const plateValueToMarkdown = (value: Value): string => {
  return value.map((node: any) => {
    const text = node.children?.map((child: any) => child.text || '').join('') || '';
    
    switch (node.type) {
      case 'h1':
        return `# ${text}`;
      case 'h2':
        return `## ${text}`;
      case 'h3':
        return `### ${text}`;
      case 'p':
      default:
        return text;
    }
  }).join('\n\n');
};

export function SplitViewDocumentEditor({ documentId }: SplitViewDocumentEditorProps) {
  // Mock document data - in real app, fetch from database
  const [document, setDocument] = useState<Document>({
    id: documentId,
    title: 'Project Overview',
    content: '# Project Overview\n\nThis document contains the main project information and requirements.\n\n## Goals\n- Create intuitive user interface\n- Implement real-time collaboration\n- Ensure scalable architecture',
    type: 'document',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(document.title);
  const [editorValue, setEditorValue] = useState<Value>(() => markdownToPlateValue(document.content));

  const editor = usePlateEditor({
    plugins: SplitViewDocumentEditorKit,
    value: editorValue,
    onChange: (newValue) => {
      setEditorValue(newValue);
    },
  });

  const handleSave = () => {
    const markdown = plateValueToMarkdown(editorValue);
    const updatedDoc = {
      ...document,
      title: editingTitle,
      content: markdown,
      updatedAt: new Date()
    };
    setDocument(updatedDoc);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditingTitle(document.title);
    setEditorValue(markdownToPlateValue(document.content));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditingTitle(document.title);
    setEditorValue(markdownToPlateValue(document.content));
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
      <div className="flex-1 overflow-hidden">
        <Plate editor={editor}>
          <EditorContainer variant="default" className="h-full">
            <Editor 
              variant="none"
              readOnly={!isEditing}
              placeholder={isEditing ? "Start writing..." : undefined}
              className="h-full p-4 text-sm"
            />
            {isEditing && <FloatingToolbar />}
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}