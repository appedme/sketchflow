'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

// Type for file content cache
interface FileCache {
    [path: string]: {
        content: string;
        timestamp: number;
        version: number;
        isDirty: boolean;
        lastAccessed: number;
    };
}

// In-memory cache
let fileCache: FileCache = {};

// Cache events
const FILE_CACHE_UPDATED = 'file:cache:updated';
const FILE_CONTENT_CHANGED = 'file:content:changed';
const FILE_SELECTED = 'file:selected';
const FILE_SAVED = 'file:saved';

// Debug mode for logging cache operations
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Log cache operations if debug mode is enabled
 */
function logCache(operation: string, path: string, details?: any) {
    if (DEBUG) {
        console.log(`[FileCache] ${operation}: ${path}`, details || '');
    }
}

/**
 * Mark a file as dirty (modified)
 * @param path File path
 */
export function markFileDirty(path: string): void {
    if (fileCache[path]) {
        fileCache[path].isDirty = true;
        fileCache[path].lastAccessed = Date.now();

        logCache('Marked dirty', path);

        // Notify listeners that file content has changed
        window.dispatchEvent(new CustomEvent(FILE_CONTENT_CHANGED, {
            detail: { path, version: fileCache[path].version, timestamp: Date.now() }
        }));
    }
}

/**
 * Update file content in cache immediately
 * @param path File path
 * @param content New content
 */
export function updateFileCache(path: string, content: string): void {
    const now = Date.now();
    const version = fileCache[path] ? fileCache[path].version + 1 : 1;

    // Update cache
    fileCache[path] = {
        content,
        timestamp: now,
        version,
        isDirty: false,
        lastAccessed: now
    };

    logCache('Updated', path, { version });

    // Notify listeners
    window.dispatchEvent(new CustomEvent(FILE_CACHE_UPDATED, {
        detail: { path, version, immediate: true, timestamp: now }
    }));
}

/**
 * Notify that a file has been saved
 * @param path File path
 * @param content File content
 */
export function notifyFileSaved(path: string, content: string): void {
    updateFileCache(path, content);

    window.dispatchEvent(new CustomEvent(FILE_SAVED, {
        detail: { path, timestamp: Date.now() }
    }));

    logCache('Saved', path);
}

/**
 * Get file content from cache or fetch it
 * @param path File path
 * @param fetchFn Function to fetch file content if not in cache
 * @param forceRefresh Force refresh from source
 * @returns File content
 */
export async function getFileContent(
    path: string,
    fetchFn: () => Promise<string>,
    forceRefresh: boolean = false
): Promise<string> {
    const cached = fileCache[path];
    const now = Date.now();

    // Always update last accessed time
    if (cached) {
        cached.lastAccessed = now;
    }

    // If file is in cache, not dirty, not forced to refresh, and not expired (10 seconds)
    if (cached && !cached.isDirty && !forceRefresh && now - cached.timestamp < 10 * 1000) {
        logCache('Cache hit', path, { age: now - cached.timestamp });
        return cached.content;
    }

    logCache('Cache miss or refresh needed', path, { forceRefresh, isDirty: cached?.isDirty });

    // Fetch file content
    try {
        const content = await fetchFn();

        // Update cache
        fileCache[path] = {
            content,
            timestamp: now,
            version: cached ? cached.version + 1 : 1,
            isDirty: false,
            lastAccessed: now
        };

        logCache('Fetched and cached', path, { version: fileCache[path].version });

        // Notify listeners
        window.dispatchEvent(new CustomEvent(FILE_CACHE_UPDATED, {
            detail: { path, version: fileCache[path].version, timestamp: now }
        }));

        return content;
    } catch (error) {
        console.error(`Error fetching file content for ${path}:`, error);

        // Return cached content if available, even if expired
        if (cached) {
            logCache('Error fetching, using cached', path);
            return cached.content;
        }

        throw error;
    }
}

/**
 * Clear file cache for a specific path or all paths
 * @param path Optional file path to clear
 */
export function clearFileCache(path?: string): void {
    if (path) {
        delete fileCache[path];
        logCache('Cleared cache for', path);
    } else {
        fileCache = {};
        logCache('Cleared all cache', '');
    }

    // Notify listeners
    window.dispatchEvent(new CustomEvent(FILE_CACHE_UPDATED, {
        detail: { cleared: true, path, timestamp: Date.now() }
    }));
}

/**
 * Notify that a file has been selected
 * @param path File path
 */
export function notifyFileSelected(path: string): void {
    const timestamp = Date.now();
    logCache('File selected', path);

    window.dispatchEvent(new CustomEvent(FILE_SELECTED, {
        detail: { path, timestamp }
    }));

    // Mark as dirty to force refresh when selected
    if (fileCache[path]) {
        fileCache[path].isDirty = true;
    }
}

/**
 * Clean up old cache entries
 * Removes entries that haven't been accessed in the last 5 minutes
 */
export function cleanupCache(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    Object.keys(fileCache).forEach(path => {
        if (now - fileCache[path].lastAccessed > maxAge) {
            delete fileCache[path];
            logCache('Cleaned up old cache', path);
        }
    });
}

// Run cache cleanup every minute
if (typeof window !== 'undefined') {
    setInterval(cleanupCache, 60 * 1000);
}

/**
 * Hook to use cached file content with automatic revalidation
 * @param path File path
 * @param fetchFn Function to fetch file content
 * @returns File content, loading state, and revalidate function
 */
export function useFileContent(path: string, fetchFn: () => Promise<string>) {
    const [content, setContent] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [version, setVersion] = useState(0);
    const isMounted = useRef(true);
    const lastFetchTime = useRef(0);

    // Load file content with debouncing
    const loadContent = useCallback(async (forceRefresh: boolean = false) => {
        const now = Date.now();

        // Debounce frequent calls (within 50ms)
        if (!forceRefresh && now - lastFetchTime.current < 50) {
            return;
        }

        lastFetchTime.current = now;
        setIsLoading(true);

        try {
            const content = await getFileContent(path, fetchFn, forceRefresh);

            // Only update state if component is still mounted
            if (isMounted.current) {
                setContent(content);
                setVersion(fileCache[path]?.version || 0);
                setIsLoading(false);
            }
        } catch (error) {
            console.error(`Error loading file content for ${path}:`, error);
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    }, [path, fetchFn]);

    // Load content on mount and when path changes
    useEffect(() => {
        isMounted.current = true;
        loadContent(true); // Force refresh when path changes

        return () => {
            isMounted.current = false;
        };
    }, [path, loadContent]);

    // Listen for cache events
    useEffect(() => {
        const handleCacheUpdate = (event: CustomEvent) => {
            const { path: updatedPath, version: updatedVersion, immediate } = event.detail;

            if (updatedPath === path && updatedVersion !== version) {
                if (immediate) {
                    loadContent(true);
                } else {
                    const cached = fileCache[path];
                    if (cached) {
                        setContent(cached.content);
                        setVersion(cached.version);
                    }
                }
            }
        };

        const handleContentChanged = (event: CustomEvent) => {
            const { path: changedPath } = event.detail;

            if (changedPath === path) {
                // When content changes, reload immediately
                loadContent(true);
            }
        };

        const handleFileSelected = (event: CustomEvent) => {
            const { path: selectedPath } = event.detail;

            if (selectedPath === path) {
                // When file is selected, always load fresh content
                loadContent(true);
            }
        };

        const handleFileSaved = (event: CustomEvent) => {
            const { path: savedPath } = event.detail;

            if (savedPath === path) {
                // When file is saved, reload content
                loadContent(true);
            }
        };

        window.addEventListener(FILE_CACHE_UPDATED as any, handleCacheUpdate as EventListener);
        window.addEventListener(FILE_CONTENT_CHANGED as any, handleContentChanged as EventListener);
        window.addEventListener(FILE_SELECTED as any, handleFileSelected as EventListener);
        window.addEventListener(FILE_SAVED as any, handleFileSaved as EventListener);

        return () => {
            window.removeEventListener(FILE_CACHE_UPDATED as any, handleCacheUpdate as EventListener);
            window.removeEventListener(FILE_CONTENT_CHANGED as any, handleContentChanged as EventListener);
            window.removeEventListener(FILE_SELECTED as any, handleFileSelected as EventListener);
            window.removeEventListener(FILE_SAVED as any, handleFileSaved as EventListener);
        };
    }, [path, version, loadContent]);

    // Function to force revalidation
    const revalidate = useCallback(() => {
        loadContent(true);
    }, [loadContent]);

    // Function to update content locally
    const updateContent = useCallback((newContent: string) => {
        setContent(newContent);
        updateFileCache(path, newContent);
    }, [path]);

    return {
        content,
        isLoading,
        revalidate,
        updateContent
    };
}
