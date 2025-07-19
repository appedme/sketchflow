"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import {
    FileText,
    Clock,
    Eye,
    Star,
    StarOff,
    MoreHorizontal,
    Edit2,
    Share2,
    Trash2,
    Copy,
    ExternalLink,
    Tag,
    X,
    Plus,
    Users,
    Globe,
    Lock,
    Sparkles,
    Calendar,
    Settings,
    Briefcase,
    Palette,
    Lightbulb,
    ClipboardList,
    Folder
} from "lucide-react";
import { ProjectLoadingOverlay } from './ProjectLoadingOverlay';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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

interface ProjectCardProps {
    project: Project;
    viewMode?: 'grid' | 'list';
    onUpdate?: () => void;
}

export function ProjectCard({ project, viewMode = "grid", onUpdate }: ProjectCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(project.name);
    const [editedDescription, setEditedDescription] = useState(project.description || '');
    const [editedCategory, setEditedCategory] = useState(project.category);
    const [editedVisibility, setEditedVisibility] = useState(project.visibility);
    const [editedTags, setEditedTags] = useState<string[]>(
        Array.isArray(project.tags) ? project.tags : []
    );
    const [newTag, setNewTag] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const openProjectSettings = () => {
        setIsLoading(true);
        setTimeout(() => {
            router.push(`/project/${project.id}/settings`);
        }, 800);
    };

    const handleSave = async () => {
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedName,
                    description: editedDescription,
                    category: editedCategory,
                    visibility: editedVisibility,
                    tags: editedTags,
                }),
            });

            if (!response.ok) throw new Error('Failed to update project');

            setIsEditing(false);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to update project:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancel = () => {
        setEditedName(project.name);
        setEditedDescription(project.description || '');
        setEditedCategory(project.category);
        setEditedVisibility(project.visibility);
        setEditedTags(Array.isArray(project.tags) ? project.tags : []);
        setIsEditing(false);
    };

    const addTag = () => {
        if (newTag.trim() && !editedTags.includes(newTag.trim())) {
            setEditedTags([...editedTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
    };

    const toggleFavorite = async () => {
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    isFavorite: !project.isFavorite,
                }),
            });

            if (!response.ok) throw new Error('Failed to update favorite status');
            onUpdate?.();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const deleteProject = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete project');

            onUpdate?.();
        } catch (error) {
            console.error('Failed to delete project:', error);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'technical': return <Settings className="w-4 h-4" />;
            case 'business': return <Briefcase className="w-4 h-4" />;
            case 'creative': return <Palette className="w-4 h-4" />;
            case 'design': return <Lightbulb className="w-4 h-4" />;
            case 'planning': return <ClipboardList className="w-4 h-4" />;
            default: return <Folder className="w-4 h-4" />;
        }
    };

    const getCategoryColor = (category: string) => {
        return 'bg-slate-50 text-slate-700 border-slate-200';
    };

    const getVisibilityIcon = (visibility: string) => {
        switch (visibility) {
            case 'public': return <Globe className="w-3 h-3" />;
            case 'team': return <Users className="w-3 h-3" />;
            default: return <Lock className="w-3 h-3" />;
        }
    };

    const getVisibilityColor = (visibility: string) => {
        return 'text-slate-600';
    };

    if (viewMode === "list") {
        return (
            <>
                <ProjectLoadingOverlay isLoading={isLoading} />
                <Card className="group hover:shadow-lg transition-all duration-300 bg-card border-border hover:border-muted-foreground/20">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                                        {project.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Link
                                            href={`/project/${project.id}`}
                                            className="font-semibold text-foreground hover:text-primary transition-colors truncate text-lg group-hover:text-primary"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setIsLoading(true);
                                                setTimeout(() => {
                                                    window.location.href = `/project/${project.id}`;
                                                }, 800);
                                            }}
                                        >
                                            {project.name}
                                        </Link>
                                        {project.isFavorite && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                        )}
                                        <div className={cn("flex items-center gap-1", getVisibilityColor(project.visibility))}>
                                            {getVisibilityIcon(project.visibility)}
                                        </div>
                                    </div>

                                    {project.description && (
                                        <p className="text-slate-600 text-sm mb-3 line-clamp-2 leading-relaxed">
                                            {project.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            {project.viewCount || 0} views
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {project.tags && project.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {project.tags.slice(0, 4).map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                                                    <Tag className="w-2 h-2 mr-1" />
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {project.tags.length > 4 && (
                                                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                                    +{project.tags.length - 4} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`${getCategoryColor(project.category)} border font-medium`}>
                                    <span className="mr-1">{getCategoryIcon(project.category)}</span>
                                    {project.category}
                                </Badge>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem>
                                            <div
                                                className="flex items-center cursor-pointer"
                                                onClick={() => {
                                                    setIsLoading(true);
                                                    setTimeout(() => {
                                                        window.location.href = `/project/${project.id}`;
                                                    }, 800);
                                                }}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Open Project
                                            </div>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Edit2 className="mr-2 h-4 w-4" />
                                            Edit Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={toggleFavorite}>
                                            {project.isFavorite ? (
                                                <>
                                                    <StarOff className="mr-2 h-4 w-4" />
                                                    Remove from favorites
                                                </>
                                            ) : (
                                                <>
                                                    <Star className="mr-2 h-4 w-4" />
                                                    Add to favorites
                                                </>
                                            )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={openProjectSettings}>
                                            <Settings className="mr-2 h-4 w-4" />
                                            Project Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            Share Project
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={deleteProject} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Project
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    placeholder="Enter project name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    placeholder="Enter project description"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={editedCategory} onValueChange={setEditedCategory}>
                                        <SelectTrigger>
                                            <SelectValue />
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
                                    <Label htmlFor="visibility">Visibility</Label>
                                    <Select value={editedVisibility} onValueChange={setEditedVisibility}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="team">Team</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {editedTags.map((tag) => (
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

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isUpdating}>
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // Grid view
    return (
        <>
            <ProjectLoadingOverlay isLoading={isLoading} />
            <Card className="group hover:shadow-xl transition-all duration-300 bg-white border-slate-200 hover:border-slate-300 hover:-translate-y-1">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center text-white font-bold text-lg shadow-lg mb-3">
                            {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1">
                            {project.isFavorite && (
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            )}
                            <div className={cn("flex items-center", getVisibilityColor(project.visibility))}>
                                {getVisibilityIcon(project.visibility)}
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem>
                                        <div
                                            className="flex items-center cursor-pointer"
                                            onClick={() => {
                                                setIsLoading(true);
                                                setTimeout(() => {
                                                    window.location.href = `/project/${project.id}`;
                                                }, 800);
                                            }}
                                        >
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Open Project
                                        </div>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Edit2 className="mr-2 h-4 w-4" />
                                        Edit Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={toggleFavorite}>
                                        {project.isFavorite ? (
                                            <>
                                                <StarOff className="mr-2 h-4 w-4" />
                                                Remove from favorites
                                            </>
                                        ) : (
                                            <>
                                                <Star className="mr-2 h-4 w-4" />
                                                Add to favorites
                                            </>
                                        )}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={openProjectSettings}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        Project Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Share2 className="mr-2 h-4 w-4" />
                                        Share Project
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={deleteProject} className="text-red-600 focus:text-red-600">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Project
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <div>
                        <Link
                            href={`/project/${project.id}`}
                            className="font-semibold text-slate-900 hover:text-blue-600 transition-colors block mb-2 group-hover:text-blue-600"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsLoading(true);
                                setTimeout(() => {
                                    window.location.href = `/project/${project.id}`;
                                }, 800);
                            }}
                        >
                            {project.name}
                        </Link>

                        {project.description && (
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed mb-3">
                                {project.description}
                            </p>
                        )}

                        <Badge variant="outline" className={`${getCategoryColor(project.category)} border font-medium mb-3`}>
                            <span className="mr-1">{getCategoryIcon(project.category)}</span>
                            {project.category}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                            {project.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                    <Tag className="w-2 h-2 mr-1" />
                                    {tag}
                                </Badge>
                            ))}
                            {project.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-700">
                                    +{project.tags.length - 3}
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {project.viewCount || 0}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Edit Dialog - Same as list view */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                placeholder="Enter project name"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                placeholder="Enter project description"
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={editedCategory} onValueChange={setEditedCategory}>
                                    <SelectTrigger>
                                        <SelectValue />
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
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={editedVisibility} onValueChange={setEditedVisibility}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="team">Team</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-2 mb-2">
                                {editedTags.map((tag) => (
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

                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isUpdating}>
                                {isUpdating ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}