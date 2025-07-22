'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useSWRConfig } from 'swr';
import { clearFileCache } from '@/lib/fileCache';

interface CacheContextType {
    /**
     * Saves all cache data to localStorage
     */
    saveAllCaches: () => void;

    /**
     * Revalidates all SWR cache data by refetching
     */
    revalidateAllCaches: () => void;

    /**
     * Clears all cache data and triggers revalidation
     */
    clearAndRevalidateAll: () => void;

    /**
     * Indicates if a cache operation is in progress
     */
    isLoading: boolean;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

interface CacheProviderProps {
    children: ReactNode;
}

export function CacheProvider({ children }: CacheProviderProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { cache, mutate } = useSWRConfig();

    /**
     * Saves all SWR cache data to localStorage
     */
    const saveAllCaches = useCallback(() => {
        setIsLoading(true);
        try {
            // Get all cache keys
            const cacheMap = cache as Map<string, any>;
            const cacheEntries = Array.from(cacheMap.entries());

            // Save to localStorage
            localStorage.setItem('app-cache-complete', JSON.stringify(cacheEntries));
            console.log('All caches saved successfully');

            // Dispatch success event
            if (typeof window !== 'undefined' && (window as any).dispatchCacheEvent) {
                (window as any).dispatchCacheEvent('success', 'All caches saved successfully');
            }
        } catch (error) {
            console.error('Error saving caches:', error);

            // Dispatch error event
            if (typeof window !== 'undefined' && (window as any).dispatchCacheEvent) {
                (window as any).dispatchCacheEvent('error', 'Failed to save caches');
            }
        } finally {
            setIsLoading(false);
        }
    }, [cache]);

    /**
     * Revalidates all SWR cache entries by triggering refetch
     */
    const revalidateAllCaches = useCallback(() => {
        setIsLoading(true);
        try {
            // Revalidate all cache keys
            mutate(
                () => true, // This matches all keys
                undefined,
                { revalidate: true }
            );
            console.log('All caches revalidation triggered');

            // Dispatch success event
            if (typeof window !== 'undefined' && (window as any).dispatchCacheEvent) {
                (window as any).dispatchCacheEvent('success', 'Revalidating all caches in background');
            }
        } catch (error) {
            console.error('Error revalidating caches:', error);

            // Dispatch error event
            if (typeof window !== 'undefined' && (window as any).dispatchCacheEvent) {
                (window as any).dispatchCacheEvent('error', 'Failed to revalidate caches');
            }
        } finally {
            setIsLoading(false);
        }
    }, [mutate]);

    /**
     * Clears all cache data and triggers revalidation
     */
    const clearAndRevalidateAll = useCallback(() => {
        setIsLoading(true);
        try {
            // Clear the cache map
            const cacheMap = cache as Map<string, any>;
            cacheMap.clear();

            // Clear localStorage cache
            localStorage.removeItem('app-cache');
            localStorage.removeItem('app-cache-complete');

            // Clear file cache
            clearFileCache();

            // Trigger revalidation
            mutate(
                () => true,
                undefined,
                { revalidate: true }
            );
            console.log('All caches cleared and revalidation triggered');

            // Dispatch success event
            if (typeof window !== 'undefined' && (window as any).dispatchCacheEvent) {
                (window as any).dispatchCacheEvent('success', 'All caches cleared and revalidating');
            }
        } catch (error) {
            console.error('Error clearing and revalidating caches:', error);

            // Dispatch error event
            if (typeof window !== 'undefined' && (window as any).dispatchCacheEvent) {
                (window as any).dispatchCacheEvent('error', 'Failed to clear and revalidate caches');
            }
        } finally {
            setIsLoading(false);
        }
    }, [cache, mutate]);

    const value = {
        saveAllCaches,
        revalidateAllCaches,
        clearAndRevalidateAll,
        isLoading
    };

    return (
        <CacheContext.Provider value={value}>
            {children}
        </CacheContext.Provider>
    );
}

export function useCacheContext() {
    const context = useContext(CacheContext);
    if (context === undefined) {
        throw new Error('useCacheContext must be used within a CacheProvider');
    }
    return context;
}