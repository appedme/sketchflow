import useSWR from 'swr';
import { useAuth } from '@clerk/nextjs';

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

// Custom hook for API calls with authentication
export function useApi<T = any>(url: string | null, options?: any) {
    const { isLoaded, userId } = useAuth();

    // Don't fetch if user is not loaded or not authenticated
    const shouldFetch = isLoaded && userId && url;

    return useSWR<T>(shouldFetch ? url : null, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        ...options,
    });
}

// Hook for public API calls (no auth required)
export function usePublicApi<T = any>(url: string | null, options?: any) {
    return useSWR<T>(url, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 5000,
        ...options,
    });
}

// Hook for mutations with optimistic updates
export function useMutation<T = any>(
    mutationFn: (data: any) => Promise<T>,
    options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: any) => void;
        optimisticUpdate?: (data: any) => void;
    }
) {
    const { mutate } = useSWR('/api/mutation', null, { revalidateOnMount: false });

    const trigger = async (data: any) => {
        try {
            // Optimistic update
            if (options?.optimisticUpdate) {
                options.optimisticUpdate(data);
            }

            const result = await mutationFn(data);

            if (options?.onSuccess) {
                options.onSuccess(result);
            }

            // Revalidate related data
            mutate();

            return result;
        } catch (error) {
            if (options?.onError) {
                options.onError(error);
            }
            throw error;
        }
    };

    return { trigger };
}