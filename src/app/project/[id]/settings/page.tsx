"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
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
    ArrowLeft,
    Share2,
    Bell,
    Shield,
    History,
    Download,
    Upload
} from "lucide-react";
import { useApi } from '@/hooks/useApi';
import { toast } from '@/components/ui/use-toast';

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

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const user = useUser();
    const projectId = params.id as string;

    // State
    const [activeTab, setActiveTab] = useState("general");
    const [isSaving, setIsSaving] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    // Project data state
    const [projectData, setProjectData] = useState<Project | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'general',
        visibility: 'private',
        tags: [] as string[],
        autoSave: true,
        notifications: true,
        collaborators: [] as string[]
    });

    // Fetch project data
    const { data: project, isLoading, error, mutate: refreshProject } = useApi<Project>(
        projectId ? `/api/projects/${projectId}` : null
    );

    // Update form data when project data is loaded
    useEffect(() => {
        if (project) {
            setProjectData(project);
            setFormData({
                name: project.name || '',
                description: project.description || '',
                category: project.category || 'general',
                visibility: project.visibility || 'private',
                tags: Array.isArray(project.tags) ? project.tags : [],
                autoSave: true, // Default values for settings not in the API
                notifications: true,
                collaborators: []
            });
        }
    }, [project]);

    // Redirect if not authenticated
    useEffect(() => {
        if (user === null) {
            router.push('/handler/sign-in?after_auth_return_to=' + encodeURIComponent(window.location.pathname));
        }
    }, [user, router]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle select changes
    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle switch changes
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    // Handle tag management
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

    // Save project settings
    const saveSettings = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    category: formData.category,
                    visibility: formData.visibility,
                    tags: formData.tags,
                }),
            });

            if (!response.ok) throw new Error('Failed to update project settings');

            refreshProject();
            toast.default({
                title: "Settings saved",
                description: "Your project settings have been updated successfully.",
            });
        } catch (error) {
            console.error('Failed to update project settings:', error);
            toast.destructive({
                title: "Error",
                description: "Failed to save project settings. Please try again.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Delete project
    const deleteProject = async () => {
        if (deleteConfirmation !== projectData?.name) {
            toast.destructive({
                title: "Confirmation failed",
                description: "Please type the project name correctly to confirm deletion.",
            });
            return;
        }

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete project');

            toast.default({
                title: "Project deleted",
                description: "Your project has been permanently deleted.",
            });

            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to delete project:', error);
            toast.destructive({
                title: "Error",
                description: "Failed to delete project. Please try again.",
            });
            setIsDeleting(false);
        }
    };

    // Show loading state while user is being determined
    if (user === undefined || isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (user === null) {
        return null;
    }

    if (error || !projectData) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <p className="text-muted-foreground">Failed to load project settings</p>
                            <Button onClick={() => refreshProject()}>Try Again</Button>
                            <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container py-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-full"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Project Settings</h1>
                            <p className="text-muted-foreground">{projectData.name}</p>
                        </div>
                    </div>
                    <Button
                        onClick={saveSettings}
                        disabled={isSaving}
                        className="gap-2"
                    >
                        {isSaving ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                        ) : (
                            <Save className="h-4 w-4" />
                        )}
                        Save Changes
                    </Button>
                </div>

                {/* Settings Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="bg-muted">
                        <TabsTrigger value="general" className="gap-2">
                            <Settings className="h-4 w-4" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="sharing" className="gap-2">
                            <Share2 className="h-4 w-4" />
                            Sharing
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Shield className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="gap-2">
                            <History className="h-4 w-4" />
                            Advanced
                        </TabsTrigger>
                    </TabsList>

                    {/* General Settings */}
                    <TabsContent value="general" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Project Information</CardTitle>
                                <CardDescription>
                                    Basic information about your project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Project Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter project name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Enter project description"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => handleSelectChange('category', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="technical">Technical</SelectItem>
                                            <SelectItem value="business">Business</SelectItem>
                                            <SelectItem value="creative">Creative</SelectItem>
                                            <SelectItem value="design">Design</SelectItem>
                                            <SelectItem value="planning">Planning</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tags</Label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {formData.tags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="gap-1">
                                                {tag}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto p-0 hover:bg-transparent"
                                                    onClick={() => removeTag(tag)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        ))}
                                        {formData.tags.length === 0 && (
                                            <span className="text-sm text-muted-foreground">No tags added</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Input
                                            value={newTag}
                                            onChange={(e) => setNewTag(e.target.value)}
                                            placeholder="Add a tag"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="outline" onClick={addTag}>
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sharing Settings */}
                    <TabsContent value="sharing" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Visibility Settings</CardTitle>
                                <CardDescription>
                                    Control who can see and access your project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <Label>Project Visibility</Label>
                                    <div className="grid gap-4">
                                        <div className="flex items-center space-x-4 rounded-md border p-4">
                                            <Lock className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium leading-none">Private</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Only you can access this project
                                                </p>
                                            </div>
                                            <input
                                                type="radio"
                                                checked={formData.visibility === 'private'}
                                                onChange={() => handleSelectChange('visibility', 'private')}
                                                className="h-4 w-4"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4 rounded-md border p-4">
                                            <Users className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium leading-none">Team</p>
                                                <p className="text-sm text-muted-foreground">
                                                    You and team members can access this project
                                                </p>
                                            </div>
                                            <input
                                                type="radio"
                                                checked={formData.visibility === 'team'}
                                                onChange={() => handleSelectChange('visibility', 'team')}
                                                className="h-4 w-4"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-4 rounded-md border p-4">
                                            <Globe className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex-1 space-y-1">
                                                <p className="font-medium leading-none">Public</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Anyone with the link can view this project
                                                </p>
                                            </div>
                                            <input
                                                type="radio"
                                                checked={formData.visibility === 'public'}
                                                onChange={() => handleSelectChange('visibility', 'public')}
                                                className="h-4 w-4"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium">Collaborators</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Invite people to collaborate on this project
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            <Plus className="h-3 w-3" /> Add People
                                        </Button>
                                    </div>

                                    <div className="rounded-md border">
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            No collaborators added yet
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Notifications Settings */}
                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>
                                    Control how you receive notifications about this project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Email Notifications</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive email notifications about project updates
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.notifications}
                                            onCheckedChange={(checked) => handleSwitchChange('notifications', checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Collaboration Updates</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Get notified when someone comments or makes changes
                                            </p>
                                        </div>
                                        <Switch
                                            checked={true}
                                            onCheckedChange={() => { }}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Weekly Summary</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Receive a weekly summary of project activity
                                            </p>
                                        </div>
                                        <Switch
                                            checked={false}
                                            onCheckedChange={() => { }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Settings</CardTitle>
                                <CardDescription>
                                    Manage security options for your project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Version History</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Keep track of all changes made to your project
                                            </p>
                                        </div>
                                        <Switch
                                            checked={true}
                                            onCheckedChange={() => { }}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Edit Protection</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Prevent accidental edits to important elements
                                            </p>
                                        </div>
                                        <Switch
                                            checked={false}
                                            onCheckedChange={() => { }}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Advanced Settings */}
                    <TabsContent value="advanced" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Options</CardTitle>
                                <CardDescription>
                                    Configure advanced settings for your project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label>Auto-Save</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Automatically save changes as you work
                                            </p>
                                        </div>
                                        <Switch
                                            checked={formData.autoSave}
                                            onCheckedChange={(checked) => handleSwitchChange('autoSave', checked)}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="grid gap-4">
                                        <div>
                                            <h3 className="font-medium mb-2">Project Data</h3>
                                            <div className="flex flex-wrap gap-2">
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    <Download className="h-3 w-3" /> Export Project
                                                </Button>
                                                <Button variant="outline" size="sm" className="gap-1">
                                                    <Upload className="h-3 w-3" /> Import Data
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Danger Zone */}
                        <Card className="border-destructive/20">
                            <CardHeader className="text-destructive">
                                <CardTitle>Danger Zone</CardTitle>
                                <CardDescription className="text-destructive/80">
                                    Irreversible actions that affect your project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="rounded-md border border-destructive/20 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-destructive">Delete Project</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This action cannot be undone. All project data will be permanently deleted.
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => {
                                                const dialog = document.getElementById('delete-dialog') as HTMLDialogElement | null;
                                                dialog?.showModal();
                                            }}
                                        >
                                            Delete Project
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Confirmation Dialog */}
            <dialog id="delete-dialog" className="modal bg-background/80 backdrop-blur-sm">
                <div className="modal-box bg-background border rounded-lg shadow-lg p-6 max-w-md mx-auto">
                    <h3 className="font-bold text-lg text-destructive mb-4">Delete Project</h3>
                    <p className="mb-4">
                        This action cannot be undone. This will permanently delete the project
                        <strong> {projectData.name}</strong> and all of its data.
                    </p>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirm">
                                Please type <strong>{projectData.name}</strong> to confirm
                            </Label>
                            <Input
                                id="confirm"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                placeholder={`Type "${projectData.name}" to confirm`}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeleteConfirmation('');
                                    const dialog = document.getElementById('delete-dialog') as HTMLDialogElement | null;
                                    dialog?.close();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={deleteProject}
                                disabled={isDeleting || deleteConfirmation !== projectData.name}
                                className="gap-2"
                            >
                                {isDeleting && (
                                    <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
                                )}
                                {isDeleting ? 'Deleting...' : 'Delete Project'}
                            </Button>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}