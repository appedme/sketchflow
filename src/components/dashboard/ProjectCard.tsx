"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
    Plus
} from "lucide-react";
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
    tags: unknown;
    status: string | null;
    lastActivityAt: string | null;
    createdAt: string;
    updatedAt: string;
}

interface ProjectCardProps {
    project: Project;
    viewMode?: 'grid' | 'list';
    onUpdate?: () => void; // Callback to refresh the project list
}

export function ProjectCard({
    project,
    viewMode = 'list',
    onUpdate
}: ProjectCardProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: project.name,
        description: project.description || '',
        category: project.category
    });
    const [newTag, setNewTag] = useState('');
    const [projectTags, setProjectTags] = useState<string[]>(
        Array.isArray(project.tags) ? project.tags : []
    );

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFavorite: !project.isFavorite }),
            });

            if (!response.ok) throw new Error('Failed to update favorite');

            onUpdate?.();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete project');

            onUpdate?.();
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) throw new Error('Failed to update project');

            setIsEditDialogOpen(false);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to update project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !projectTags.includes(newTag.trim())) {
            setProjectTags([...projectTags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setProjectTags(projectTags.filter(tag => tag !== tagToRemove));
    };

    const handleSaveTags = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tags: projectTags }),
            });

            if (!response.ok) throw new Error('Failed to update tags');

            setIsTagDialogOpen(false);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to update tags:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const ActionDropdown = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/project/${project.id}`}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsTagDialogOpen(true)}>
                    <Tag className="w-4 h-4 mr-2" />
                    Manage Tags
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    if (viewMode === 'grid') {
        return (
            <>
                <Card className="group hover:shadow-md transition-all duration-200 border-border bg-card">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="p-1 h-auto"
                                    onClick={handleToggleFavorite}
                                    disabled={isLoading}
                                >
                                    {project.isFavorite ? (
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    ) : (
                                        <StarOff className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </Button>
                                <ActionDropdown />
                            </div>
                        </div>

                        <Link href={`/project/${project.id}`} className="block">
                            <div className="space-y-3">
                                <div>
                                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                        {project.name}
                                    </h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {project.description || 'No description'}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap">
                                    <Badge variant="secondary" className="text-xs capitalize">
                                        {project.category}
                                    </Badge>
                                    {Array.isArray(project.tags) && project.tags.length > 0 && (
                                        <>
                                            {project.tags.slice(0, 2).map((tag: string) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                            {project.tags.length > 2 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{project.tags.length - 2}
                                                </Badge>
                                            )}
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {project.viewCount || 0}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </CardContent>
                </Card>

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleEdit} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Tag Management Dialog */}
                <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Tags</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Current Tags</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {projectTags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="gap-1">
                                            {tag}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 w-4 h-4"
                                                onClick={() => handleRemoveTag(tag)}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="newTag">Add New Tag</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="newTag"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                        placeholder="Enter tag name"
                                    />
                                    <Button onClick={handleAddTag} size="sm">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveTags} disabled={isLoading}>
                                    {isLoading ? 'Saving...' : 'Save Tags'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    // List view
    return (
        <>
            <Card className="group hover:shadow-sm transition-all duration-200 border-border bg-card">
                <CardContent className="p-4">
                    <Link href={`/project/${project.id}`} className="block">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                            {project.name}
                                        </h3>
                                        {project.isFavorite && (
                                            <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                        {project.description || 'No description'}
                                    </p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Badge variant="secondary" className="text-xs capitalize">
                                            {project.category}
                                        </Badge>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Eye className="w-3 h-3" />
                                            {project.viewCount || 0} views
                                        </div>
                                        {Array.isArray(project.tags) && project.tags.length > 0 && (
                                            <div className="flex items-center gap-1">
                                                {project.tags.slice(0, 3).map((tag: string) => (
                                                    <Badge key={tag} variant="outline" className="text-xs">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {project.tags.length > 3 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{project.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleFavorite}
                                    disabled={isLoading}
                                    className="p-2"
                                >
                                    {project.isFavorite ? (
                                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    ) : (
                                        <StarOff className="w-4 h-4" />
                                    )}
                                </Button>
                                <ActionDropdown />
                            </div>
                        </div>
                    </Link>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editForm.description}
                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Input
                                id="category"
                                value={editForm.category}
                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEdit} disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tag Management Dialog */}
            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Tags</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Current Tags</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {projectTags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="gap-1">
                                        {tag}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 w-4 h-4"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </Badge>
                                ))}
                                {projectTags.length === 0 && (
                                    <p className="text-sm text-muted-foreground">No tags added yet</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="newTag">Add New Tag</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="newTag"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                    placeholder="Enter tag name"
                                />
                                <Button onClick={handleAddTag} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsTagDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleSaveTags} disabled={isLoading}>
                                {isLoading ? 'Saving...' : 'Save Tags'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}