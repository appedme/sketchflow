'use client';

import { Plate, usePlateEditor } from 'platejs/react';

import { BasicNodesKit } from '@/components/editor/plugins/basic-nodes-kit';
import { Editor, EditorContainer } from '@/components/ui/editor';

interface PlateEditorProps {
  value?: any[];
  onChange?: (value: any[]) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function PlateEditor({ 
  value = defaultValue, 
  onChange, 
  placeholder = "Type...",
  readOnly = false 
}: PlateEditorProps) {
  const editor = usePlateEditor({
    plugins: BasicNodesKit,
    value,
    onChange,
    readOnly,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" placeholder={placeholder} />
      </EditorContainer>
    </Plate>
  );
}

const defaultValue = [
  {
    children: [{ text: 'Basic Editor' }],
    type: 'h1',
  },
  {
    children: [{ text: 'Heading 2' }],
    type: 'h2',
  },
  {
    children: [{ text: 'Heading 3' }],
    type: 'h3',
  },
  {
    children: [{ text: 'This is a blockquote element' }],
    type: 'blockquote',
  },
  {
    children: [
      { text: 'Basic marks: ' },
      { bold: true, text: 'bold' },
      { text: ', ' },
      { italic: true, text: 'italic' },
      { text: ', ' },
      { text: 'underline', underline: true },
      { text: ', ' },
      { strikethrough: true, text: 'strikethrough' },
      { text: '.' },
    ],
    type: 'p',
  },
];
