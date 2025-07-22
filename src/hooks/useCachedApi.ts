import useSWR, { SWRConfiguration, Cache } from 'swr';
import { useUser } from '@stackframe/stack';

// Create a persistent storage object
const localStorageProvider = (): Cache => {
    // When initializing, restore from localStorage
    const map = new Map(
        JSON.parse(localStorage.getItem('app-cache') || '[]')
    );

    // Before unloading the app, save all data back to localStorage
    window.addEventListener('beforeunload', () => {
        const appCache = JSON.stringify(Array.from(map.entries()));
        localStorage.setItem('app-cache', appCache);
    });

    // Save to localStorage periodically in case of crashes
    setInterval(() => {
        const appCache = JSON.stringify(Array.from(map.entries()));
        localStorage.setItem('app-cache', appCache);
    }, 5000);

    return map as Cache;
};

// Default fetcher function
const fetcher = async (url: string): Promise<any> => {
    const res = await fetch(url);
    if (!res.ok) {
        const error = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object
        (error as any).info = await res.json();
        (error as any).status = res.status;
        throw error;
    }
    return res.json();
};

// Enhanced API hook with persistent caching
export function useCachedApi<T = any>(url: string | null, options?: SWRConfiguration) {
    const user = useUser();

    // Don't fetch if user is not loaded or not authenticated
    const shouldFetch = user && url;

    return useSWR<T>(
        shouldFetch ? url : null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            provider: typeof window !== 'undefined' ? localStorageProvider : undefined,
            // Keep using stale data while revalidating
            revalidateIfStale: true,
            // Keep the data even if there's an error
            keepPreviousData: true,
            // Load from cache immediately, then update in the background
            loadingTimeout: 0,
            ...options,
        }
    );
}

// Hook for public API calls (no auth required) with caching
export function usePublicCachedApi<T = any>(url: string | null, options?: SWRConfiguration) {
    return useSWR<T>(
        url,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 5000,
            provider: typeof window !== 'undefined' ? localStorageProvider : undefined,
            revalidateIfStale: true,
            keepPreviousData: true,
            loadingTimeout: 0,
            ...options,
        }
    );
}