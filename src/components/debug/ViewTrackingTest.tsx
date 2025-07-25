"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface ViewTrackingTestProps {
    projectId: string;
    userId?: string;
}

export function ViewTrackingTest({ projectId, userId }: ViewTrackingTestProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string>('');

    const testViewTracking = async () => {
        setLoading(true);
        setResult('');

        try {
            console.log('Testing view tracking for project:', projectId);

            const response = await fetch(`/api/projects/${projectId}/views`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: userId || null,
                }),
            });

            const data = await response.json();
            console.log('View tracking response:', response.status, data);

            if (response.ok) {
                setResult(`✅ Success: ${data.message}`);
            } else {
                setResult(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error('View tracking test error:', error);
            setResult(`❌ Network Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testStats = async () => {
        setLoading(true);
        setResult('');

        try {
            console.log('Testing stats for project:', projectId);

            const response = await fetch(`/api/projects/${projectId}/stats`);
            const data = await response.json();
            console.log('Stats response:', response.status, data);

            if (response.ok) {
                setResult(`📊 Stats: ${data.viewCount} views`);
            } else {
                setResult(`❌ Stats Error: ${data.error}`);
            }
        } catch (error) {
            console.error('Stats test error:', error);
            setResult(`❌ Stats Network Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 border rounded-lg bg-muted/50">
            <h3 className="font-semibold mb-2">View Tracking Debug</h3>
            <div className="flex gap-2 mb-2">
                <Button
                    size="sm"
                    onClick={testViewTracking}
                    disabled={loading}
                    className="gap-1"
                >
                    <Eye className="w-3 h-3" />
                    {loading ? 'Testing...' : 'Test View Track'}
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={testStats}
                    disabled={loading}
                >
                    Get Stats
                </Button>
            </div>
            {result && (
                <div className="text-sm p-2 bg-background rounded border">
                    {result}
                </div>
            )}
            <div className="text-xs text-muted-foreground mt-1">
                Project ID: {projectId}
            </div>
        </div>
    );
}