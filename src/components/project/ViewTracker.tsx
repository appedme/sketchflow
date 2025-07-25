"use client";

import { useViewTracking } from '@/hooks/useViewTracking';
import { useProjectStats } from '@/hooks/useProjectStats';
import { Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViewTrackerProps {
    projectId: string;
    userId?: string | null;
    isOwner?: boolean;
    showLiveCount?: boolean;
    className?: string;
}

export function ViewTracker({
    projectId,
    userId,
    isOwner = false,
    showLiveCount = false,
    className = ""
}: ViewTrackerProps) {
    // Track the view
    useViewTracking({
        projectId,
        userId,
        isOwner,
        delay: 3000,
    });

    // Get live stats if requested
    const { stats } = useProjectStats({
        projectId,
        refreshInterval: 30000, // Refresh every 30 seconds
        enabled: showLiveCount,
    });

    if (!showLiveCount) {
        return null;
    }

    return (
        <Badge variant="secondary" className={`flex items-center gap-1 ${className}`}>
            <Eye className="w-3 h-3" />
            <span>{stats?.viewCount || 0} views</span>
        </Badge>
    );
}