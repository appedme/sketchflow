import { useEffect, useRef } from 'react';

interface UseViewTrackingOptions {
    projectId: string;
    userId?: string | null;
    isOwner?: boolean;
    delay?: number; // Delay before counting view (in milliseconds)
}

export function useViewTracking({
    projectId,
    userId,
    isOwner = false,
    delay = 3000 // 3 seconds delay by default
}: UseViewTrackingOptions) {
    const hasTrackedView = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        // Don't track views for:
        // 1. Project owners (they shouldn't count as views of their own project)
        // 2. If we've already tracked a view for this session
        if (isOwner || hasTrackedView.current) {
            return;
        }

        // Set a timeout to track the view after the specified delay
        // This ensures the user actually spent time viewing the project
        timeoutRef.current = setTimeout(async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/views`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId || null,
                    }),
                });

                if (response.ok) {
                    hasTrackedView.current = true;
                    console.log('Project view tracked successfully');
                } else {
                    console.warn('Failed to track project view');
                }
            } catch (error) {
                console.error('Error tracking project view:', error);
            }
        }, delay);

        // Cleanup timeout on unmount or dependency change
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [projectId, userId, isOwner, delay]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
}