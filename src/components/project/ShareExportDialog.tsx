"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Share2,
    Download,
    Upload,
    Copy,
    Link,
    FileJson,
    Globe,
    Lock,
    Eye,
    Users,
    Settings,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    projectName: string;
    defaultTab?: 'share' | 'export' | 'import';
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
    const [shareSettings, setShareSettings] = useState({
        visibility: 'private',
        allowComments: false,
        allowDownload: false,
        password: ''
    });
    const [copied, setCopied] = useState(false);

    // Generate share URL
    const generateShareUrl = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    settings: shareSettings
                }),
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
    const exportProject = async (format: 'json' | 'pdf' | 'png') => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/export?format=${format}`);
            if (!response.ok) throw new Error('Failed to export project');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `${projectName}-export.${format}`;
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

    // Import project
    const importProject = async (file: File) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', projectId);

            const response = await fetch('/api/projects/import', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to import project');

            const result = await response.json();

            // Refresh the page to show imported content
            window.location.reload();
        } catch (error) {
            console.error('Error importing project:', error);
            alert('Failed to import project. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.sketchflow';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                await importProject(file);
            }
        };
        input.click();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="w-5 h-5" />
                        Share, Export & Import
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="share" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </TabsTrigger>
                        <TabsTrigger value="export" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </TabsTrigger>
                        <TabsTrigger value="import" className="gap-2">
                            <Upload className="w-4 h-4" />
                            Import
                        </TabsTrigger>
                    </TabsList>

                    {/* Share Tab */}
                    <TabsContent value="share" className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">Share Settings</Label>
                                <p className="text-sm text-muted-foreground">Configure how others can access your project</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Visibility</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant={shareSettings.visibility === 'private' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setShareSettings({ ...shareSettings, visibility: 'private' })}
                                            className="gap-2"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Private
                                        </Button>
                                        <Button
                                            variant={shareSettings.visibility === 'public' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setShareSettings({ ...shareSettings, visibility: 'public' })}
                                            className="gap-2"
                                        >
                                            <Globe className="w-4 h-4" />
                                            Public
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Permissions</Label>
                                    <div className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={shareSettings.allowComments}
                                                onChange={(e) => setShareSettings({ ...shareSettings, allowComments: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span>Allow comments</span>
                                        </label>
                                        <label className="flex items-center space-x-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={shareSettings.allowDownload}
                                                onChange={(e) => setShareSettings({ ...shareSettings, allowDownload: e.target.checked })}
                                                className="rounded"
                                            />
                                            <span>Allow download</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {shareSettings.visibility === 'private' && (
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password Protection (Optional)</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter password"
                                        value={shareSettings.password}
                                        onChange={(e) => setShareSettings({ ...shareSettings, password: e.target.value })}
                                    />
                                </div>
                            )}

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
                                <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium">Share link created!</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input value={shareUrl} readOnly className="font-mono text-sm" />
                                        <Button onClick={copyToClipboard} size="sm" variant="outline">
                                            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Anyone with this link can {shareSettings.visibility === 'public' ? 'view' : 'access'} your project
                                    </p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* Export Tab */}
                    <TabsContent value="export" className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">Export Options</Label>
                                <p className="text-sm text-muted-foreground">Download your project in different formats</p>
                            </div>

                            <div className="grid gap-4">
                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileJson className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <h4 className="font-medium">SketchFlow Project</h4>
                                            <p className="text-sm text-muted-foreground">Complete project with all canvases and documents</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => exportProject('json')}
                                        disabled={isLoading}
                                        size="sm"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileJson className="w-8 h-8 text-green-600" />
                                        <div>
                                            <h4 className="font-medium">PDF Document</h4>
                                            <p className="text-sm text-muted-foreground">Static PDF with all project content</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => exportProject('pdf')}
                                        disabled={isLoading}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export'}
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <FileJson className="w-8 h-8 text-purple-600" />
                                        <div>
                                            <h4 className="font-medium">PNG Images</h4>
                                            <p className="text-sm text-muted-foreground">High-quality images of all canvases</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => exportProject('png')}
                                        disabled={isLoading}
                                        size="sm"
                                        variant="outline"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Export'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Import Tab */}
                    <TabsContent value="import" className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-base font-medium">Import Project</Label>
                                <p className="text-sm text-muted-foreground">Import a SketchFlow project file</p>
                            </div>

                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <h4 className="font-medium mb-2">Import SketchFlow Project</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select a .json or .sketchflow file to import
                                </p>
                                <Button
                                    onClick={handleFileImport}
                                    disabled={isLoading}
                                    className="gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Upload className="w-4 h-4" />
                                    )}
                                    Choose File
                                </Button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium text-blue-900 mb-1">Import Process</p>
                                        <ul className="text-blue-800 space-y-1">
                                            <li>• Validates the project file format</li>
                                            <li>• Creates new canvases and documents</li>
                                            <li>• Preserves all project structure and content</li>
                                            <li>• Automatically refreshes the workspace</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}