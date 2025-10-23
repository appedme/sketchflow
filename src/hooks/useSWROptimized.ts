import useSWR, { SWRConfiguration, mutate as globalMutate } from 'swr';
import { useUser } from '@stackframe/stack';
import { useCallback } from 'react';

// Enhanced fetcher with better error handling
const fetcher = async (url: string): Promise<any> => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
    try {
      const errorData = await res.json();
      (error as any).info = errorData;
    } catch {
      (error as any).info = { message: res.statusText };
    }
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};

// Authenticated fetcher
const authenticatedFetcher = async (url: string): Promise<any> => {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });
  
  if (!res.ok) {
    const error = new Error('An error occurred while fetching the data.');
    try {
      const errorData = await res.json();
      (error as any).info = errorData;
    } catch {
      (error as any).info = { message: res.statusText };
    }
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};

// Default SWR configuration
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  focusThrottleInterval: 5000,
  loadingTimeout: 10000,
  onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
    // Never retry on 404
    if (error.status === 404) return;
    
    // Never retry on 401/403 (auth errors)
    if (error.status === 401 || error.status === 403) return;
    
    // Only retry up to 3 times
    if (retryCount >= 3) return;
    
    // Retry after 1 second with exponential backoff
    setTimeout(() => revalidate({ retryCount }), 1000 * Math.pow(2, retryCount));
  },
};

// Enhanced useApi hook with optimizations
export function useApiOptimized<T = any>(
  url: string | null, 
  options?: SWRConfiguration & {
    requireAuth?: boolean;
    refreshInterval?: number;
    suspense?: boolean;
  }
) {
  const user = useUser();
  const { requireAuth = true, ...swrOptions } = options || {};
  
  // Don't fetch if auth is required but user is not loaded or not authenticated
  const shouldFetch = requireAuth ? (user && url) : url;
  
  const config = {
    ...defaultConfig,
    ...swrOptions,
  };
  
  const result = useSWR<T>(
    shouldFetch ? url : null, 
    requireAuth ? authenticatedFetcher : fetcher,
    config
  );

  // Enhanced mutate function with optimistic updates
  const optimisticMutate = useCallback(
    (data?: T | Promise<T> | ((currentData?: T) => T), shouldRevalidate = true) => {
      return result.mutate(data, shouldRevalidate);
    },
    [result.mutate]
  );

  return {
    ...result,
    mutate: optimisticMutate,
  };
}

// Hook for public API calls (no auth required)
export function usePublicApiOptimized<T = any>(
  url: string | null, 
  options?: SWRConfiguration & {
    requireAuth?: boolean;
    refreshInterval?: number;
    suspense?: boolean;
  }
) {
  return useApiOptimized<T>(url, { ...options, requireAuth: false });
}

// Hook for real-time data with polling
export function useRealtimeApi<T = any>(
  url: string | null,
  intervalMs: number = 30000,
  options?: SWRConfiguration & {
    requireAuth?: boolean;
    refreshInterval?: number;
    suspense?: boolean;
  }
) {
  return useApiOptimized<T>(url, {
    ...options,
    refreshInterval: intervalMs,
    revalidateOnFocus: true,
  });
}

// Hook for paginated data
export function usePaginatedApi<T = any>(
  getUrl: (pageIndex: number, previousPageData: T | null) => string | null,
  options?: SWRConfiguration
) {
  const user = useUser();
  
  // Separate SWR-specific options from custom options
  const swrOptions = options ? { ...options } : {};
  
  return useSWR<T[]>(
    user ? getUrl : null,
    authenticatedFetcher,
    {
      ...defaultConfig,
      ...swrOptions,
    }
  );
}

// Enhanced mutation hook with better error handling and optimistic updates
export function useMutationOptimized<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: any, variables: TVariables) => void;
    onMutate?: (variables: TVariables) => Promise<any> | any;
    onSettled?: (data: TData | undefined, error: any | undefined, variables: TVariables) => void;
    invalidateKeys?: string[];
    optimisticUpdate?: {
      key: string;
      updater: (variables: TVariables, currentData: any) => any;
    };
  }
) {
  const trigger = useCallback(
    async (variables: TVariables) => {
      let rollback: (() => void) | undefined;
      
      try {
        // Optimistic update
        if (options?.optimisticUpdate) {
          const { key, updater } = options.optimisticUpdate;
          const currentData = globalMutate(key, undefined, false);
          const optimisticData = updater(variables, currentData);
          
          // Apply optimistic update
          globalMutate(key, optimisticData, false);
          
          // Create rollback function
          rollback = () => globalMutate(key, currentData, false);
        }

        // Call onMutate
        const context = await options?.onMutate?.(variables);

        // Execute mutation
        const result = await mutationFn(variables);

        // Invalidate related keys
        if (options?.invalidateKeys) {
          await Promise.all(
            options.invalidateKeys.map(key => globalMutate(key))
          );
        }

        // Call onSuccess
        options?.onSuccess?.(result, variables);
        
        return result;
      } catch (error) {
        // Rollback optimistic update on error
        rollback?.();
        
        // Call onError
        options?.onError?.(error, variables);
        
        throw error;
      } finally {
        // Call onSettled
        options?.onSettled?.(undefined, undefined, variables);
      }
    },
    [mutationFn, options]
  );

  return { trigger };
}

// Utility function for cache invalidation
export function invalidateCache(keys: string | string[]) {
  const keysArray = Array.isArray(keys) ? keys : [keys];
  return Promise.all(keysArray.map(key => globalMutate(key)));
}

// Utility function for preloading data
export function preloadData<T>(url: string, requireAuth = true) {
  return globalMutate(
    url,
    (requireAuth ? authenticatedFetcher : fetcher)(url),
    false
  );
}