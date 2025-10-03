import useSWR, { mutate } from 'swr';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { useCallback, useEffect } from 'react';

interface FileData {
    id: string;
    title: string;
    type: 'canvas' | 'document';
    content?: any;
    elements?: any[];
    appState?: any;
    updatedAt: string;
    createdAt: string;
}

const fetcher = async (url: string): Promise<FileData> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.status}`);
    }
    return res.json();
};

export function useFileData(fileId: string | null, fileType: 'canvas' | 'document' | null) {
    const { setCacheData, getCacheData, markFileDirty } = useWorkspaceStore();

    // Generate API URL
    const apiUrl = fileId && fileType
        ? (fileType === 'canvas' ? `/api/canvas/${fileId}` : `/api/documents/${fileId}`)
        : null;

    // Get cached data
    const cachedData = fileId ? getCacheData(fileId) : null;

    const swrResult = useSWR<FileData>(
        apiUrl,
        fetcher,
        {
            // Use cached data as fallback
            fallbackData: cachedData,

            // Aggressive caching for instant switching
            dedupingInterval: 30000, // Increased to 30 seconds for better performance
            revalidateOnFocus: false,
            revalidateOnReconnect: false, // Disable to prevent unnecessary revalidation

            // Keep previous data while loading - this is key for smooth switching
            keepPreviousData: true,

            // Error handling
            errorRetryCount: 2, // Reduced retry count for faster failure
            errorRetryInterval: 500, // Faster retry interval

            // Custom revalidation
            revalidateIfStale: false, // Disable stale revalidation for better performance

            // Faster loading timeout
            loadingTimeout: 50, // Reduced timeout for quicker response
            
            // Cache for longer to improve switching performance
            refreshInterval: 0, // Disable automatic refresh
        }
    );

    // Update cache when data changes
    useEffect(() => {
        if (swrResult.data && fileId) {
            setCacheData(fileId, swrResult.data);
        }
    }, [swrResult.data, fileId, setCacheData]);

    // Save function with optimistic updates
    const saveFile = useCallback(async (updates: Partial<FileData>) => {
        if (!fileId || !fileType || !swrResult.data) return;

        // Mark as dirty
        markFileDirty(fileId, true);

        // Optimistic update
        const optimisticData = { ...swrResult.data, ...updates };
        setCacheData(fileId, optimisticData);

        // Update SWR cache optimistically
        mutate(apiUrl, optimisticData, false);

        try {
            const endpoint = fileType === 'canvas' ? `/api/canvas/${fileId}` : `/api/documents/${fileId}`;
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error(`Save failed: ${response.status}`);
            }

            const savedData = await response.json();

            // Update cache with server response
            setCacheData(fileId, savedData);
            mutate(apiUrl, savedData, false);

            // Mark as clean
            markFileDirty(fileId, false);

            return savedData;
        } catch (error) {
            // Revert optimistic update on error
            mutate(apiUrl);
            markFileDirty(fileId, false);
            throw error;
        }
    }, [fileId, fileType, apiUrl, swrResult.data, setCacheData, markFileDirty]);

    // Auto-save functionality with more aggressive timing
    const autoSave = useCallback((updates: Partial<FileData>, delay = 500) => {
        // More aggressive auto-save timing (500ms instead of 2000ms)
        const timeoutId = setTimeout(() => {
            saveFile(updates).catch(console.error);
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [saveFile]);

    return {
        ...swrResult,
        saveFile,
        autoSave,
        isCanvas: fileType === 'canvas',
        isDocument: fileType === 'document',
    };
}