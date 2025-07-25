import { useState, useEffect } from 'react';

interface ProjectStats {
    viewCount: number;
    lastActivityAt: string | null;
    updatedAt: string;
}

interface UseProjectStatsOptions {
    projectId: string;
    refreshInterval?: number; // in milliseconds
    enabled?: boolean;
}

export function useProjectStats({
    projectId,
    refreshInterval = 30000, // 30 seconds default
    enabled = true
}: UseProjectStatsOptions) {
    const [stats, setStats] = useState<ProjectStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        if (!enabled) return;

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/projects/${projectId}/stats`);

            if (!response.ok) {
                throw new Error('Failed to fetch project stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
            console.error('Error fetching project stats:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!enabled) return;

        // Fetch stats immediately
        fetchStats();

        // Set up interval for periodic updates
        const interval = setInterval(fetchStats, refreshInterval);

        return () => clearInterval(interval);
    }, [projectId, refreshInterval, enabled]);

    return {
        stats,
        loading,
        error,
        refetch: fetchStats,
    };
}