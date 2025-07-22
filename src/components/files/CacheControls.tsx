'use client';

import React from 'react';
import { useCacheContext } from '@/contexts/CacheContext';
import { useFileOperations } from './FileStatusIndicator';
import { useLoading } from '@/components/ui/loading-bar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Loader2, Save, RefreshCw, Trash2, Database, FileRefresh } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { clearFileCache } from '@/lib/fileCache';
import { toast } from 'sonner';

export function CacheControls() {
    const { saveAllCaches, revalidateAllCaches, clearAndRevalidateAll, isLoading } = useCacheContext();
    const { startOperation, completeOperation } = useFileOperations();
    const { startLoading, completeLoading } = useLoading();
    const [isFileCacheClearing, setIsFileCacheClearing] = React.useState(false);
    const [isDatabaseRevalidating, setIsDatabaseRevalidating] = React.useState(false);

    // Handle clearing file cache
    const handleClearFileCache = React.useCallback(async () => {
        const operationId = `clear-file-cache-${Date.now()}`;
        setIsFileCacheClearing(true);
        
        try {
            startOperation(operationId, 'deleting', 'File cache', 'Clearing file cache...');
            startLoading('Clearing file cache...', 'warning');
            
            clearFileCache();
            
            completeOperation(operationId, true, 'File cache cleared');
            completeLoading(true, 'File cache cleared successfully');
            toast.success('File cache cleared successfully');
        } catch (error) {
            completeOperation(operationId, false, 'Failed to clear file cache');
            completeLoading(false, 'Failed to clear file cache');
            toast.error('Failed to clear file cache');
            console.error('Error clearing file cache:', error);
        } finally {
            setTimeout(() => setIsFileCacheClearing(false), 500);
        }
    }, [startOperation, completeOperation, startLoading, completeLoading]);

    // Handle database revalidation
    const handleDatabaseRevalidate = React.useCallback(() => {
        setIsDatabaseRevalidating(true);
        try {
            // Dispatch a custom event that database listeners can respond to
            window.dispatchEvent(new CustomEvent('database:revalidate', {
                detail: { timestamp: Date.now() }
            }));

            toast.success('Database revalidation triggered', {
                description: 'Fetching fresh data from the database'
            });

            // Also trigger SWR revalidation
            revalidateAllCaches();
        } catch (error) {
            toast.error('Failed to revalidate database');
            console.error('Error revalidating database:', error);
        } finally {
            // Show loading state for a bit to provide feedback
            setTimeout(() => setIsDatabaseRevalidating(false), 1000);
        }
    }, [revalidateAllCaches]);

    return (
        <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/30">
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={saveAllCaches}
                                disabled={isLoading}
                                className="h-8 w-8 p-0"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Save all caches</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={revalidateAllCaches}
                                disabled={isLoading}
                                className="h-8 w-8 p-0"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Revalidate all caches</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAndRevalidateAll}
                                disabled={isLoading}
                                className="h-8 w-8 p-0"
                            >
                                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Clear and revalidate all caches</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="flex items-center gap-1">
                {/* Database revalidation */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDatabaseRevalidate}
                                disabled={isDatabaseRevalidating}
                                className="h-8 w-8 p-0"
                            >
                                {isDatabaseRevalidating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Database className="h-4 w-4" />
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Revalidate database</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                {/* File cache control */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleClearFileCache}
                                disabled={isFileCacheClearing}
                                className="h-8 w-8 p-0"
                            >
                                {isFileCacheClearing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <svg
                                        className="h-4 w-4"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                                        <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" />
                                        <path d="M12 17v.01" />
                                        <path d="M9.5 10.5a2.5 2.5 0 0 1 5 0v3a2.5 2.5 0 0 1 -5 0v-3z" />
                                        <path d="M10 14h4" />
                                    </svg>
                                )}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                            <p>Clear file cache</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
}