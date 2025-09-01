"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { useDebounce } from '@/hooks/shared/use-debounce';

interface Document {
  id: string;
  projectId: string;
  title: string;
  content?: any;
  contentText?: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentContextType {
  document: Document | null;
  isLoading: boolean;
  error: any;
  title: string;
  content: string;
  saving: boolean;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  saveDocument: () => Promise<void>;
  reloadDocument: () => Promise<void>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

interface DocumentProviderProps {
  children: ReactNode;
  documentId: string;
}

export function DocumentProvider({ children, documentId }: DocumentProviderProps) {
  const user = useUser();
  const [document, setDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Debounce title and content for auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 2000);

  // Load document data directly without caching
  const loadDocumentData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to load document');
      }

      const documentData = await response.json();
      setDocument(documentData);
      setTitle(documentData?.title || '');
      setContent(documentData?.contentText || '');
    } catch (err) {
      console.error('Failed to load document:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, documentId]);

  // Load document on mount and when dependencies change
  useEffect(() => {
    loadDocumentData();
  }, [loadDocumentData]);

  // Manual save function
  const saveDocument = async () => {
    if (!document || !user?.id) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title,
          contentText: content,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any)?.error || 'Failed to save document');
      }

      const updatedDoc = await response.json();
      setDocument(updatedDoc);

    } catch (error) {
      console.error('Failed to save document:', error);
      // You could add a toast notification here
      alert('Failed to save document. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save when title or content changes
  useEffect(() => {
    if (!document || !user?.id) return;
    if (debouncedTitle === (document as any)?.title && debouncedContent === (document as any)?.contentText) return;

    const autoSave = async () => {
      try {
        setSaving(true);
        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: debouncedTitle,
            contentText: debouncedContent,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save document');
        }

        // Update local state
        setDocument(prev => prev ? {
          ...prev,
          title: debouncedTitle,
          contentText: debouncedContent,
          updatedAt: new Date().toISOString(),
        } : null);

      } catch (error) {
        console.error('Failed to auto-save document:', error);
      } finally {
        setSaving(false);
      }
    };

    autoSave();
  }, [debouncedTitle, debouncedContent, document, documentId, user?.id]);

  return (
    <DocumentContext.Provider
      value={{
        document: document || null,
        isLoading,
        error,
        title,
        content,
        saving,
        setTitle,
        setContent,
        saveDocument,
        reloadDocument: loadDocumentData,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocument must be used within a DocumentProvider');
  }
  return context;
}