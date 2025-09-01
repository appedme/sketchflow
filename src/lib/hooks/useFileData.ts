import useSWR, { mutate } from 'swr';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { useCallback, useEffect, useRef } from 'react';

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

// Enhanced fetcher with better error handling and caching
const fetcher = async (url: string): Promise<FileData> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Cache-Control': 'max-age=300', // 5 minute browser cache
            },
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
            throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`);
        }
        
        return res.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('Request timeout - please try again');
        }
        throw error;
    }
};

export function useFileData(fileId: string | null, fileType: 'canvas' | 'document' | null) {
    const { setCacheData, getCacheData, markFileDirty } = useWorkspaceStore();
    const saveTimeoutRef = useRef<NodeJS.Timeout>();
    const lastSaveTimeRef = useRef<number>(0);
    const dataVersionRef = useRef<number>(0);

    // Generate API URL
    const apiUrl = fileId && fileType
        ? (fileType === 'canvas' ? `/api/canvas/${fileId}` : `/api/documents/${fileId}`)
        : null;

    // Get cached data with version checking
    const cachedData = fileId ? getCacheData(fileId) : null;

    const swrResult = useSWR<FileData>(
        apiUrl,
        fetcher,
        {
            // Use cached data as fallback
            fallbackData: cachedData,

            // Aggressive caching strategy to prevent re-renders
            dedupingInterval: 30000, // 30 seconds - prevent duplicate requests
            revalidateOnFocus: false, // Don't refetch on window focus
            revalidateOnReconnect: false, // Don't refetch on reconnect
            revalidateIfStale: false, // Don't revalidate stale data automatically
            revalidateOnMount: !cachedData, // Only fetch if no cache

            // Keep previous data while loading - crucial for preventing re-renders
            keepPreviousData: true,

            // Error handling
            errorRetryCount: 2,
            errorRetryInterval: 3000,
            shouldRetryOnError: (error) => {
                return !error.message.includes('404') && !error.message.includes('403');
            },

            // Performance optimizations
            loadingTimeout: 5000,
            focusThrottleInterval: 30000, // 30 seconds between focus revalidations
            
            // Custom compare function to prevent unnecessary updates
            compare: (a, b) => {
                if (!a || !b) return false;
                return JSON.stringify(a) === JSON.stringify(b);
            },
        }
    );

    // Update cache when data changes with version tracking
    useEffect(() => {
        if (swrResult.data && fileId) {
            const currentVersion = dataVersionRef.current;
            dataVersionRef.current = currentVersion + 1;
            
            setCacheData(fileId, {
                ...swrResult.data,
                _version: dataVersionRef.current,
                _cachedAt: Date.now(),
            }, 1800000); // 30 minutes TTL
        }
    }, [swrResult.data, fileId, setCacheData]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    // Optimized save function with conflict resolution
    const saveFile = useCallback(async (updates: Partial<FileData>) => {
        if (!fileId || !fileType || !swrResult.data) return;

        const now = Date.now();
        
        // Prevent too frequent saves (minimum 1 second between saves)
        if (now - lastSaveTimeRef.current < 1000) {
            return;
        }

        lastSaveTimeRef.current = now;

        // Mark as dirty
        markFileDirty(fileId, true);

        // Optimistic update with version tracking
        const optimisticData = { 
            ...swrResult.data, 
            ...updates,
            updatedAt: new Date().toISOString(),
            _version: dataVersionRef.current + 1,
            _optimistic: true,
        };
        
        // Update cache immediately for instant UI feedback
        setCacheData(fileId, optimisticData);
        mutate(apiUrl, optimisticData, false);

        try {
            const endpoint = fileType === 'canvas' ? `/api/canvas/${fileId}` : `/api/documents/${fileId}`;
            const response = await fetch(endpoint, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache',
                    'If-Match': swrResult.data.updatedAt, // Optimistic concurrency control
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                if (response.status === 409) {
                    // Conflict - reload data
                    mutate(apiUrl);
                    throw new Error('File was modified by another user. Please refresh and try again.');
                }
                throw new Error(`Save failed: ${response.status} ${response.statusText}`);
            }

            const savedData = await response.json();
            
            // Update cache with server response
            dataVersionRef.current = savedData._version || dataVersionRef.current + 1;
            const finalData = {
                ...savedData,
                _version: dataVersionRef.current,
                _optimistic: false,
            };
            
            setCacheData(fileId, finalData);
            mutate(apiUrl, finalData, false);

            // Mark as clean
            markFileDirty(fileId, false);

            return finalData;
        } catch (error) {
            // Revert optimistic update on error
            mutate(apiUrl);
            markFileDirty(fileId, true);
            throw error;
        }
    }, [fileId, fileType, apiUrl, swrResult.data, setCacheData, markFileDirty]);

    // Enhanced auto-save with debouncing and conflict detection
    const autoSave = useCallback((updates: Partial<FileData>, delay = 3000) => {
        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout with longer delay for auto-save
        saveTimeoutRef.current = setTimeout(() => {
            saveFile(updates).catch(error => {
                console.error('Auto-save failed:', error);
                // Could implement retry logic or user notification here
            });
        }, delay);

        // Return cleanup function
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [saveFile]);

    // Force refresh function that bypasses cache
    const refreshFile = useCallback(() => {
        if (apiUrl) {
            // Clear cache first
            setCacheData(fileId!, null);
            // Then revalidate
            mutate(apiUrl, undefined, true);
        }
    }, [apiUrl, fileId, setCacheData]);

    // Preload function for better UX
    const preloadFile = useCallback(() => {
        if (apiUrl && !swrResult.data && !swrResult.isLoading) {
            mutate(apiUrl);
        }
    }, [apiUrl, swrResult.data, swrResult.isLoading]);

    return {
        ...swrResult,
        saveFile,
        autoSave,
        refreshFile,
        preloadFile,
        isCanvas: fileType === 'canvas',
        isDocument: fileType === 'document',
        // Enhanced loading state that considers cached data
        isInitialLoading: swrResult.isLoading && !cachedData,
        // Version info for conflict detection
        version: swrResult.data?._version || 0,
        isOptimistic: swrResult.data?._optimistic || false,
    };
}

// Enhanced hook for managing multiple files with better performance
export function useMultipleFiles(fileIds: string[]) {
    const { getCacheData } = useWorkspaceStore();
    
    const results = fileIds.map(fileId => {
        const cachedData = getCacheData(fileId);
        const fileType = cachedData?.type || null;

        return {
            fileId,
            ...useFileData(fileId, fileType)
        };
    });

    return {
        files: results,
        isLoading: results.some(r => r.isInitialLoading),
        hasError: results.some(r => r.error),
        errors: results.filter(r => r.error).map(r => r.error),
        refreshAll: () => results.forEach(r => r.refreshFile()),
        preloadAll: () => results.forEach(r => r.preloadFile()),
    };
}

// Preload file data for better performance
export function preloadFileData(fileId: string, fileType: 'canvas' | 'document') {
    const apiUrl = fileType === 'canvas' ? `/api/canvas/${fileId}` : `/api/documents/${fileId}`;
    
    // Preload without subscribing to updates
    mutate(apiUrl, fetcher(apiUrl), false);
}