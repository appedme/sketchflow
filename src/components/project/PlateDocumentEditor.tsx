"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/components/editor/plugins/basic-marks-kit';
import { AutoformatKit } from '@/components/editor/plugins/autoformat-kit';
import { ExitBreakKit } from '@/components/editor/plugins/exit-break-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { FixedToolbarKit } from '@/components/editor/plugins/fixed-toolbar-kit';
import { FloatingToolbarKit } from '@/components/editor/plugins/floating-toolbar-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Edit3, Eye, ChevronDown } from 'lucide-react';

// Simplified plugin set for document editing
const DocumentEditorKit = [
  ...BasicBlocksKit,
  ...BasicMarksKit,
  ...LinkKit,
  ...ListKit,
  ...AutoformatKit,
  ...ExitBreakKit,
  ...MarkdownKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

interface PlateDocumentEditorProps {
  title: string;
  content: string;
  isEditing: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

// Convert markdown content to Plate value
const markdownToPlateValue = (markdown: string): any[] => {
  // Simple conversion - in production you'd want a proper markdown parser
  const lines = markdown.split('\n');
  const value: any[] = [];
  
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
      // Skip empty lines or add as paragraph
      continue;
    } else {
      value.push({
        type: 'p',
        children: [{ text: line }],
      });
    }
  }
  
  // Ensure we have at least one paragraph
  if (value.length === 0) {
    value.push({
      type: 'p',
      children: [{ text: '' }],
    });
  }
  
  return value;
};

// Convert Plate value back to markdown
const plateValueToMarkdown = (value: any[]): string => {
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

export function PlateDocumentEditor({
  title,
  content,
  isEditing,
  onTitleChange,
  onContentChange,
  onSave,
  onEdit,
  onCancel
}: PlateDocumentEditorProps) {
  const [editorValue, setEditorValue] = useState<any[]>(() => markdownToPlateValue(content));
  const [titleValue, setTitleValue] = useState(title);

  const editor = usePlateEditor({
    plugins: DocumentEditorKit,
    value: editorValue,
  });

  // Handle content changes
  const handleEditorChange = React.useCallback((options: { value: any[] }) => {
    setEditorValue(options.value);
    if (isEditing) {
      const markdown = plateValueToMarkdown(options.value);
      onContentChange(markdown);
    }
  }, [isEditing, onContentChange]);

  // Update editor value when content changes externally
  useEffect(() => {
    if (!isEditing) {
      const newValue = markdownToPlateValue(content);
      setEditorValue(newValue);
      // Reset editor content when switching to view mode
      editor.children = newValue;
    }
  }, [content, isEditing, editor]);

  // Update editor value when switching to edit mode
  useEffect(() => {
    if (isEditing) {
      const newValue = markdownToPlateValue(content);
      setEditorValue(newValue);
      editor.children = newValue;
    }
  }, [isEditing, editor, content]);

  // Update title when it changes externally
  useEffect(() => {
    setTitleValue(title);
  }, [title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
    onTitleChange(e.target.value);
  };

  const handleSave = () => {
    const markdown = plateValueToMarkdown(editorValue);
    onContentChange(markdown);
    onSave();
  };

  if (!isEditing) {
    // Read-only view
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-lg text-gray-900 truncate">{title}</h1>
            <p className="text-sm text-gray-500">View Mode</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="w-4 h-4" />
                  View Mode
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Switch to Edit Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Read-only content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <Plate editor={editor} onChange={handleEditorChange}>
            <EditorContainer variant="default">
              <Editor variant="default" readOnly className="min-h-full" />
            </EditorContainer>
          </Plate>
        </div>
      </div>
    );
  }

  // Editing view
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-50">
        <div className="flex-1 min-w-0 mr-4">
          <input
            value={titleValue}
            onChange={handleTitleChange}
            className="font-semibold text-lg text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-500"
            placeholder="Document title..."
          />
          <p className="text-sm text-blue-600">Edit Mode</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Mode
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onCancel}>
                <Eye className="w-4 h-4 mr-2" />
                Switch to View Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            size="sm"
            onClick={handleSave}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Plate editor={editor} onChange={handleEditorChange}>
          <FixedToolbar>
            <div className="flex items-center gap-1 p-2 bg-white border-b border-gray-200">
              <span className="text-sm text-gray-600">Rich text editor</span>
            </div>
          </FixedToolbar>
          
          <EditorContainer variant="default" className="flex-1">
            <Editor 
              variant="default" 
              placeholder="Start writing your document..."
              className="h-full p-4 focus:outline-none"
            />
            <FloatingToolbar />
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}