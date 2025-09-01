'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useFileOperations } from '@/components/files/FileStatusIndicator';
import { useDebounce } from '../shared/use-debounce';

interface UseDocumentAutoSaveOptions {
  documentId: string;
  content: any;
  title?: string;
  autoSaveInterval?: number;
  onSave?: (content: any, title?: string) => Promise<void>;
  enabled?: boolean;
}

export function useDocumentAutoSave({
  documentId,
  content,
  title,
  autoSaveInterval = 2000,
  onSave,
  enabled = true
}: UseDocumentAutoSaveOptions) {
  const { startOperation, completeOperation } = useFileOperations();
  const lastSavedContent = useRef<any>(null);
  const lastSavedTitle = useRef<string | undefined>(undefined);
  const operationIdRef = useRef<string | null>(null);

  // Debounce content and title changes
  const debouncedContent = useDebounce(content, autoSaveInterval);
  const debouncedTitle = useDebounce(title, 1000);

  // Auto-save function
  const performAutoSave = useCallback(async (
    contentToSave: any, 
    titleToSave?: string
  ) => {
    if (!enabled || !onSave) return;

    const operationId = `autosave-${documentId}-${Date.now()}`;
    operationIdRef.current = operationId;

    try {
      // Start the save operation
      startOperation(
        operationId, 
        'saving', 
        `Document: ${titleToSave || documentId}`, 
        'Auto-saving document...'
      );

      // Perform the save
      await onSave(contentToSave, titleToSave);

      // Update last saved references
      lastSavedContent.current = contentToSave;
      lastSavedTitle.current = titleToSave;

      // Complete the operation
      completeOperation(operationId, true, 'Document auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      completeOperation(operationId, false, 'Auto-save failed');
    }
  }, [documentId, enabled, onSave, startOperation, completeOperation]);

  // Auto-save when content changes
  useEffect(() => {
    if (!enabled) return;

    const contentChanged = JSON.stringify(debouncedContent) !== JSON.stringify(lastSavedContent.current);
    const titleChanged = debouncedTitle !== lastSavedTitle.current;

    if (contentChanged || titleChanged) {
      performAutoSave(debouncedContent, debouncedTitle);
    }
  }, [debouncedContent, debouncedTitle, enabled, performAutoSave]);

  // Manual save function
  const manualSave = useCallback(async () => {
    if (!enabled || !onSave) return;

    const operationId = `manualsave-${documentId}-${Date.now()}`;
    operationIdRef.current = operationId;

    try {
      startOperation(
        operationId, 
        'saving', 
        `Document: ${title || documentId}`, 
        'Saving document...'
      );

      await onSave(content, title);

      lastSavedContent.current = content;
      lastSavedTitle.current = title;

      completeOperation(operationId, true, 'Document saved successfully');
    } catch (error) {
      console.error('Manual save failed:', error);
      completeOperation(operationId, false, 'Save failed');
    }
  }, [documentId, content, title, enabled, onSave, startOperation, completeOperation]);

  // Check if there are unsaved changes
  const hasUnsavedChanges = 
    JSON.stringify(content) !== JSON.stringify(lastSavedContent.current) ||
    title !== lastSavedTitle.current;

  return {
    manualSave,
    hasUnsavedChanges,
    isAutoSaving: operationIdRef.current !== null
  };
}