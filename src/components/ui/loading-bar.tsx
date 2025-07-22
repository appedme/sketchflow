'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const loadingBarVariants = cva(
    "h-1 fixed top-0 left-0 z-50 transition-all",
    {
        variants: {
            variant: {
                default: "bg-primary",
                success: "bg-green-500",
                warning: "bg-yellow-500",
                error: "bg-red-500",
            },
            state: {
                idle: "opacity-0",
                loading: "opacity-100",
                complete: "opacity-0",
            }
        },
        defaultVariants: {
            variant: "default",
            state: "idle"
        }
    }
);

export interface LoadingBarProps extends VariantProps<typeof loadingBarVariants> {
    isLoading?: boolean;
    progress?: number;
    className?: string;
    duration?: number;
    onComplete?: () => void;
}

export function LoadingBar({
    isLoading = false,
    progress,
    variant,
    state: forcedState,
    className,
    duration = 2000,
    onComplete
}: LoadingBarProps) {
    const [width, setWidth] = useState(0);
    const [state, setState] = useState<'idle' | 'loading' | 'complete'>('idle');

    useEffect(() => {
        let timer: NodeJS.Timeout;
        let completeTimer: NodeJS.Timeout;

        if (isLoading) {
            setState('loading');

            // If progress is provided, use it directly
            if (progress !== undefined) {
                setWidth(progress);

                // If progress reaches 100%, trigger complete state
                if (progress >= 100) {
                    setState('complete');
                    completeTimer = setTimeout(() => {
                        setState('idle');
                        setWidth(0);
                        onComplete?.();
                    }, 500);
                }
            }
            // Otherwise, animate from 0 to 90% over the duration
            else {
                setWidth(0);

                // Animate to 90% (leaving room for completion)
                timer = setTimeout(() => {
                    setWidth(90);
                }, 10);
            }
        } else if (state === 'loading') {
            // When loading finishes, animate to 100%
            setWidth(100);
            setState('complete');

            // Then hide after a delay
            completeTimer = setTimeout(() => {
                setState('idle');
                setWidth(0);
                onComplete?.();
            }, 500);
        }

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [isLoading, progress, duration, onComplete, state]);

    return (
        <div
            className={cn(
                loadingBarVariants({ variant, state: forcedState || state }),
                className
            )}
            style={{ width: `${width}%` }}
        />
    );
}

// Global loading state manager
type LoadingState = {
    isLoading: boolean;
    message: string;
    variant: 'default' | 'success' | 'warning' | 'error';
};

type LoadingActions = {
    startLoading: (message?: string, variant?: LoadingState['variant']) => void;
    completeLoading: (success?: boolean, message?: string) => void;
};

const LoadingContext = React.createContext<LoadingState & LoadingActions>({
    isLoading: false,
    message: '',
    variant: 'default',
    startLoading: () => { },
    completeLoading: () => { },
});

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<LoadingState>({
        isLoading: false,
        message: '',
        variant: 'default',
    });

    const startLoading = useCallback((message = 'Loading...', variant: LoadingState['variant'] = 'default') => {
        setState({ isLoading: true, message, variant });
    }, []);

    const completeLoading = useCallback((success = true, message?: string) => {
        setState(prev => ({
            isLoading: false,
            message: message || prev.message,
            variant: success ? 'success' : 'error',
        }));
    }, []);

    return (
        <LoadingContext.Provider
            value={{
                ...state,
                startLoading,
                completeLoading,
            }}
        >
            <LoadingBar
                isLoading={state.isLoading}
                variant={state.variant}
            />
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    return React.useContext(LoadingContext);
}