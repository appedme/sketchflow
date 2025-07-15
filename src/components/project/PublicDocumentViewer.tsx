"use client";

import { PlateDocumentEditor } from './PlateDocumentEditor';

interface PublicDocumentViewerProps {
  documentId: string;
  projectId: string;
  projectName: string;
}

export function PublicDocumentViewer({ 
  documentId, 
  projectId, 
  projectName 
}: PublicDocumentViewerProps) {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-lg text-gray-900">{projectName}</h1>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Public Document
          </span>
        </div>
      </div>
      <div className="flex-1">
        <PlateDocumentEditor
          documentId={documentId}
          projectId={projectId}
          isReadOnly={true}
        />
      </div>
    </div>
  );
}