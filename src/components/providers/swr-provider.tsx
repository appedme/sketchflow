'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import HydrationErrorBoundary from '../utils/HydrationErrorBoundary';
import { CacheProvider } from '@/contexts/CacheContext';

// Create a persistent storage object
const localStorageProvider = () => {
    if (typeof window === 'undefined') {
        return new Map();
    }

    // When initializing, restore from localStorage
    const map = new Map<string, any>(
        JSON.parse(localStorage.getItem('app-cache') || '[]')
    );

    // Before unloading the app, save all data back to localStorage
    window.addEventListener('beforeunload', () => {
        const appCache = JSON.stringify(Array.from(map.entries()));
        localStorage.setItem('app-cache', appCache);
    });

    return map;
};

interface SWRProviderProps {
    children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
    return (
        <HydrationErrorBoundary>
            <SWRConfig
                value={{
                    provider: typeof window !== 'undefined' ? localStorageProvider : undefined,
                    revalidateOnFocus: false,
                    revalidateOnReconnect: true,
                    dedupingInterval: 5000,
                    keepPreviousData: true,
                    revalidateIfStale: true,
                    loadingTimeout: 0,
                    onError: (error) => {
                        // Log errors but prevent them from crashing the app
                        console.error('SWR Error:', error);
                    },
                }}
            >
                <CacheProvider>
                    {children}
                </CacheProvider>
            </SWRConfig>
        </HydrationErrorBoundary>
    );
}