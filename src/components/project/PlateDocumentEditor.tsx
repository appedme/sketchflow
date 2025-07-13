"use client";

import * as React from 'react';
import { useState, useEffect } from 'react';
import { PlateEditor } from '@/components/editor/plate-editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Save, Edit3, Eye, ChevronDown } from 'lucide-react';

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

export function PlateDocumentEditor({
  title,
  content,
  isEditing,
  onTitleChange,
  onContentChange,
  onSave,
  onEdit,
  onCancel,
}: PlateDocumentEditorProps) {
  const [editorValue, setEditorValue] = useState<any[]>(() => 
    getDefaultValue(content)
  );
  const [editingTitle, setEditingTitle] = useState(title);

  // Update editor value when content changes
  useEffect(() => {
    const newValue = getDefaultValue(content);
    setEditorValue(newValue);
  }, [content]);

  const handleEditorChange = (value: any[]) => {
    setEditorValue(value);
    // Convert back to simple text for now
    const text = plateValueToText(value);
    onContentChange(text);
  };

  const handleSave = () => {
    onTitleChange(editingTitle);
    onSave();
  };

  const handleCancel = () => {
    setEditingTitle(title);
    setEditorValue(getDefaultValue(content));
    onCancel();
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
          <PlateEditor 
            value={editorValue}
            placeholder="Start writing your document..."
            readOnly={true}
          />
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
          <Input
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="font-semibold text-lg text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-500"
            placeholder="Document title..."
          />
          <p className="text-sm text-blue-600">Edit Mode</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            className="gap-2"
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
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden p-4">
        <PlateEditor 
          value={editorValue}
          onChange={handleEditorChange}
          placeholder="Start writing your document..."
          readOnly={false}
        />
      </div>
    </div>
  );
}