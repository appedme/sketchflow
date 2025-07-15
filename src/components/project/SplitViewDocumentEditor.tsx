"use client";

import * as React from 'react';
import { PlateDocumentEditor } from './PlateDocumentEditor';

interface SplitViewDocumentEditorProps {
  documentId: string;
  projectId?: string;
}

export function SplitViewDocumentEditor({
  documentId,
  projectId = ''
}: SplitViewDocumentEditorProps) {
  return (
    <div className="h-full bg-background">
      <PlateDocumentEditor
        documentId={documentId}
        projectId={projectId}
        className="h-full border-0"
      />
    </div>
  );
}