"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Settings,
    Save,
    Tag,
    X,
    Plus,
    Users,
    Globe,
    Lock,
    Trash2,
    Share2,
    Bell,
    Shield,
    History,
    Download,
    Upload,
    Calendar,
    Eye,
    Heart,
    Loader2,
    AlertTriangle
} from "lucide-react";
import { useApi } from '@/hooks/useApi';
import { mutate } from 'swr';

interface Project {
    id: string;
    name: string;
    description: string | null;
    category: string;
    visibility: string;
    ownerId: string;
    viewCount: number | null;
    isFavorite: boolean | null;
    tags: string[] | null;
    status: string | null;
    lastActivityAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ProjectSettingsModalProps {
    projectId: string;
    projectName: string;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function ProjectSettingsModal({
    projectId,
    projectName,
    isOpen: externalIsOpen,
    onOpenChange: externalOnOpenChange,
    trigger
}: ProjectSettingsModalProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalOnOpenChange || setInternalIsOpen;

    const user = useUser();
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [newTag, setNewTag] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'other',
        visibility: 'private',
        tags: [] as string[],
        status: 'active',
        isFavorite: false
    });

    // Fetch project data
    const { data: project, isLoading, error } = useApi<Project>(
        isOpen ? `/api/projects/${projectId}` : null
    );

    // Update form data when project loads
    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                category: project.category || 'other',
                visibility: project.visibility || 'private',
                tags: project.tags || [],
                status: project.status || 'active',
                isFavorite: project.isFavorite || false
            });
        }
    }, [project]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to update project');

            // Update SWR cache
            mutate(`/api/projects/${projectId}`);
            mutate('/api/projects');

            // Update document title if name changed
            if (formData.name !== projectName) {
                document.title = `${formData.name} - SketchFlow`;
            }

            setIsOpen(false);
        } catch (error) {
            console.error('Failed to update project:', error);
            alert('Failed to update project. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${project?.name}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete project');

            // Update SWR cache
            mutate('/api/projects');

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to delete project:', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}

            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Project Settings
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span className="ml-2">Loading project details...</span>
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-8 text-red-600">
                        <AlertTriangle className="w-6 h-6 mr-2" />
                        Failed to load project details
                    </div>
                ) : (
                    <ScrollArea className="max-h-[70vh]">
                        <Tabs defaultValue="general" className="space-y-6">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="general">General</TabsTrigger>
                                <TabsTrigger value="sharing">Sharing</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                                <TabsTrigger value="danger">Danger Zone</TabsTrigger>
                            </TabsList>

                            <TabsContent value="general" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Basic Information</CardTitle>
                                        <CardDescription>
                                            Update your project's basic details and metadata.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Project Name</Label>
                                                <Input
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                    placeholder="Enter project name"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category">Category</Label>
                                                <Select
                                                    value={formData.category}
                                                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="design">Design</SelectItem>
                                                        <SelectItem value="development">Development</SelectItem>
                                                        <SelectItem value="business">Business</SelectItem>
                                                        <SelectItem value="education">Education</SelectItem>
                                                        <SelectItem value="personal">Personal</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                placeholder="Describe your project..."
                                                rows={3}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Tags</Label>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {formData.tags.map((tag) => (
                                                    <Badge key={tag} variant="secondary" className="gap-1">
                                                        <Tag className="w-3 h-3" />
                                                        {tag}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                                                            onClick={() => removeTag(tag)}
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </Button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                <Input
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    placeholder="Add a tag..."
                                                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                                                />
                                                <Button onClick={addTag} size="sm">
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="favorite"
                                                checked={formData.isFavorite}
                                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: checked }))}
                                            />
                                            <Label htmlFor="favorite" className="flex items-center gap-2">
                                                <Heart className="w-4 h-4" />
                                                Mark as favorite
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Project Statistics</CardTitle>
                                        <CardDescription>
                                            Overview of your project's activity and engagement.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <Eye className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                                                <div className="text-2xl font-bold">{project?.viewCount || 0}</div>
                                                <div className="text-sm text-muted-foreground">Views</div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <Calendar className="w-6 h-6 mx-auto mb-2 text-green-500" />
                                                <div className="text-sm font-medium">Created</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {project?.createdAt && formatDate(project.createdAt)}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-muted/50 rounded-lg">
                                                <History className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                                                <div className="text-sm font-medium">Last Activity</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {project?.lastActivityAt ? formatDate(project.lastActivityAt) : 'Never'}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="sharing" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Visibility & Sharing</CardTitle>
                                        <CardDescription>
                                            Control who can access and view your project.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Project Visibility</Label>
                                            <Select
                                                value={formData.visibility}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="private">
                                                        <div className="flex items-center gap-2">
                                                            <Lock className="w-4 h-4" />
                                                            Private - Only you can access
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="public">
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="w-4 h-4" />
                                                            Public - Anyone with the link can view
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {formData.visibility === 'public' && (
                                            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Globe className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium text-blue-900 dark:text-blue-100">Public Project</span>
                                                </div>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    This project is publicly accessible. Anyone with the link can view it, but only you can edit it.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="advanced" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Advanced Settings</CardTitle>
                                        <CardDescription>
                                            Configure advanced project settings and status.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Project Status</Label>
                                            <Select
                                                value={formData.status}
                                                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="active">Active</SelectItem>
                                                    <SelectItem value="archived">Archived</SelectItem>
                                                    <SelectItem value="draft">Draft</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <Separator />

                                        <div className="space-y-4">
                                            <h4 className="font-medium">Project Actions</h4>
                                            <div className="flex gap-2">
                                                <Button variant="outline" className="gap-2">
                                                    <Download className="w-4 h-4" />
                                                    Export Project
                                                </Button>
                                                <Button variant="outline" className="gap-2">
                                                    <Upload className="w-4 h-4" />
                                                    Import Data
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="danger" className="space-y-6">
                                <Card className="border-red-200 dark:border-red-800">
                                    <CardHeader>
                                        <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                                        <CardDescription>
                                            Irreversible and destructive actions for this project.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <div className="flex items-center gap-2 mb-2">
                                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                                <span className="font-medium text-red-900 dark:text-red-100">Delete Project</span>
                                            </div>
                                            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                                Once you delete a project, there is no going back. Please be certain.
                                            </p>
                                            <Button
                                                variant="destructive"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className="gap-2"
                                            >
                                                {deleting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                {deleting ? 'Deleting...' : 'Delete Project'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </ScrollArea>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving || isLoading}>
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}