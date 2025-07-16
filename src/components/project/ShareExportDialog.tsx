"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Share2,
    Download,
    Copy,
    Link,
    FileJson,
    Globe,
    CheckCircle,
    Loader2,
    Clock,
    Users
} from 'lucide-react';

interface ShareExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    defaultTab?: 'share' | 'export';
}

export function ShareExportDialog({
    isOpen,
    onClose,
    projectId,
    projectName,
    defaultTab = 'share'
}: ShareExportDialogProps) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const [isLoading, setIsLoading] = useState(false);
    const [shareUrl, setShareUrl] = useState('');
    const [copied, setCopied] = useState(false);

    // Generate share URL - automatically makes project public
    const generateShareUrl = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/projects/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });

            if (!response.ok) throw new Error('Failed to create share link');

            const { shareToken } = await response.json();
            const url = `${window.location.origin}/share/${shareToken}`;
            setShareUrl(url);
        } catch (error) {
            console.error('Error creating share link:', error);
            alert('Failed to create share link. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Copy to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    // Export project
    const exportProject = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/export`);
            if (!response.ok) throw new Error('Failed to export project');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${projectName}-export.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error exporting project:', error);
            alert('Failed to export project. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Share & Export
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="share" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </TabsTrigger>
                        <TabsTrigger value="export" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </TabsTrigger>
                    </TabsList>

                    {/* Share Tab */}
                    <TabsContent value="share" className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">Share Project</Label>
                                <p className="text-sm text-muted-foreground">
                                    Generate a public link to share your project with others
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900 mb-1">Public Sharing</p>
                                        <p className="text-blue-800">
                                            Creating a share link will automatically make your project public.
                                            Anyone with the link can view your project.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={generateShareUrl}
                                disabled={isLoading}
                                className="w-full gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Link className="w-4 h-4" />
                                )}
                                Generate Share Link
                            </Button>

                            {shareUrl && (
                                <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-900">Share link created!</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input value={shareUrl} readOnly className="font-mono text-sm" />
                                        <Button onClick={copyToClipboard} size="sm" variant="outline">
                                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-green-700">
                                        Anyone with this link can view your project
                                    </p>
                                </div>
                            )}

                            {/* Coming Soon Features */}
                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-sm font-medium text-muted-foreground">Coming Soon</Label>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Users className="w-4 h-4" />
                                        <span>Real-time collaboration</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>Expiring links</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Export Tab */}
                    <TabsContent value="export" className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">Export Project</Label>
                                <p className="text-sm text-muted-foreground">
                                    Download your complete project as a JSON file
                                </p>
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileJson className="w-8 h-8 text-blue-600" />
                                    <div>
                                        <h4 className="font-medium">SketchFlow Project</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Complete project with all canvases and documents
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={exportProject}
                                    disabled={isLoading}
                                    size="sm"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export'}
                                </Button>
                            </div>

                            {/* Coming Soon Features */}
                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-sm font-medium text-muted-foreground">Coming Soon</Label>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>• PDF export with formatted documents</p>
                                    <p>• PNG export of canvas diagrams</p>
                                    <p>• Project import functionality</p>
                                    <p>• Embedded sharing options</p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}