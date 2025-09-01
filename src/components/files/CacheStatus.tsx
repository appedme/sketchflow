'use client';

import React, { useEffect, useState } from 'react';
import { useCache } from '@/hooks/files/useCache';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CacheStatusProps {
    showNotifications?: boolean;
}

export function CacheStatus({ showNotifications = true }: CacheStatusProps) {
    const { isLoading } = useCache();

    // Set up event listeners for cache events
    useEffect(() => {
        const handleCacheEvent = (event: CustomEvent) => {
            const { type, message, action, actionLabel } = event.detail;

            if (type === 'success') {
                toast.success(message, {
                    action: action && actionLabel ? {
                        label: actionLabel,
                        onClick: action
                    } : undefined
                });
            } else {
                toast.error(message, {
                    action: action && actionLabel ? {
                        label: actionLabel,
                        onClick: action
                    } : undefined
                });
            }
        };

        // Add event listeners
        window.addEventListener('cache:success' as any, handleCacheEvent as EventListener);
        window.addEventListener('cache:error' as any, handleCacheEvent as EventListener);

        return () => {
            // Remove event listeners
            window.removeEventListener('cache:success' as any, handleCacheEvent as EventListener);
            window.removeEventListener('cache:error' as any, handleCacheEvent as EventListener);
        };
    }, []);

    // Helper to dispatch cache events
    const dispatchCacheEvent = (type: 'success' | 'error', message: string, action?: () => void, actionLabel?: string) => {
        const event = new CustomEvent(`cache:${type}`, {
            detail: { type, message, action, actionLabel }
        });
        window.dispatchEvent(event);
    };

    // Expose the dispatch function globally
    useEffect(() => {
        if (typeof window !== 'undefined') {
            (window as any).dispatchCacheEvent = dispatchCacheEvent;
        }
        return () => {
            if (typeof window !== 'undefined') {
                delete (window as any).dispatchCacheEvent;
            }
        };
    }, []);

    // No UI rendering needed as we're using Sonner toast
    return null;
}