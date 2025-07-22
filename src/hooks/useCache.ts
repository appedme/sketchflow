'use client';

import { useCacheContext } from '@/contexts/CacheContext';

/**
 * Hook to access cache management functionality
 * 
 * @returns Cache management functions and state
 */
export function useCache() {
    const cacheContext = useCacheContext();

    return {
        /**
         * Saves all cache data to localStorage
         */
        saveAll: cacheContext.saveAllCaches,

        /**
         * Revalidates all SWR cache data by refetching
         */
        revalidateAll: cacheContext.revalidateAllCaches,

        /**
         * Clears all cache data and triggers revalidation
         */
        clearAndRevalidateAll: cacheContext.clearAndRevalidateAll,

        /**
         * Indicates if a cache operation is in progress
         */
        isLoading: cacheContext.isLoading
    };
}