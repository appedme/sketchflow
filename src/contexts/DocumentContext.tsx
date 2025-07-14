"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';
import { useUser } from '@clerk/nextjs';
import { useDebounce } from '@/hooks/use-debounce';
import { useState, useEffect } from 'react';

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
  mutateDocument: () => void;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

interface DocumentProviderProps {
  children: ReactNode;
  documentId: string;
}

export function DocumentProvider({ children, documentId }: DocumentProviderProps) {
  const { user } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Debounce title and content for auto-save
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 2000);

  const { data: document, error, mutate: mutateDocument } = useSWR(
    user?.id && documentId ? `/api/documents/${documentId}` : null,
    fetcher
  );

  // Initialize local state when document loads
  useEffect(() => {
    if (document) {
      setTitle(document.title || '');
      setContent(document.contentText || '');
    }
  }, [document]);

  // Auto-save when title or content changes
  useEffect(() => {
    if (!document || !user?.id) return;
    if (debouncedTitle === document.title && debouncedContent === document.contentText) return;
    
    const saveDocument = async () => {
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

        // Update the cache optimistically
        mutate(`/api/documents/${documentId}`, {
          ...document,
          title: debouncedTitle,
          contentText: debouncedContent,
          updatedAt: new Date().toISOString(),
        }, false);
        
      } catch (error) {
        console.error('Failed to save document:', error);
      } finally {
        setSaving(false);
      }
    };
    
    saveDocument();
  }, [debouncedTitle, debouncedContent, document, documentId, user?.id, mutateDocument]);

  const isLoading = !document && !error;

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
        mutateDocument,
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