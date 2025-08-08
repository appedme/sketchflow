'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WorkspaceError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const router = useRouter();

    useEffect(() => {
        console.error('Workspace error:', error);
    }, [error]);

    return (
        <div className="h-full w-full flex items-center justify-center bg-background">
            <div className="text-center space-y-6 max-w-md">
                <div className="flex items-center justify-center">
                    <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mb-2">
                        Workspace Error
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Something went wrong while loading your workspace.
                    </p>
                    {error.message && (
                        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                            <code>{error.message}</code>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex gap-2 justify-center">
                        <Button onClick={reset} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button onClick={() => router.back()}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Go Back
                        </Button>
                    </div>

                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                    >
                        <Home className="w-4 h-4 mr-2" />
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}