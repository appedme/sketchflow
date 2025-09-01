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
    Clock,
    Eye,
    Star,
    StarOff,
    MoreHorizontal,
    Edit2,
    Trash2,
    Copy,
    X,
    Plus,
    Globe,
    Lock,
    Sparkles,
    Settings,
    Briefcase,
    Palette,
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
import { ProjectSettingsModal } from '@/components/project/ProjectSettingsModal';
import {
    useUpdateProject,
    useDeleteProject,
    useDuplicateProject,
    useToggleFavorite,
    type Project,
    type UpdateProjectData
} from '@/hooks/workspace/useProjects';

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
    const [isLoading, setIsLoading] = useState(false);

    // SWR mutations
    const updateProject = useUpdateProject();
    const deleteProject = useDeleteProject();
    const duplicateProject = useDuplicateProject();
    const toggleFavorite = useToggleFavorite();

    const handleSave = async () => {
        try {
            const updateData: UpdateProjectData = {
                name: editedName,
                description: editedDescription,
                category: editedCategory,
                visibility: editedVisibility,
                tags: editedTags,
            };

            await updateProject.trigger({ projectId: project.id, data: updateData });
            setIsEditing(false);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to save project:', error);
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

    const handleToggleFavorite = async () => {
        try {
            await toggleFavorite.trigger({
                projectId: project.id,
                isFavorite: !project.isFavorite
            });
            onUpdate?.();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            try {
                await deleteProject.trigger(project.id);
                onUpdate?.();
            } catch (error) {
                console.error('Failed to delete project:', error);
            }
        }
    };

    const handleDuplicate = async () => {
        try {
            await duplicateProject.trigger(project.id);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to duplicate project:', error);
        }
    };

    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    const getCategoryIcon = (category: string) => {
        const iconMap: Record<string, any> = {
            'business': Briefcase,
            'design': Palette,
            'education': ClipboardList,
            'personal': Sparkles,
            'other': Folder,
        };
        const IconComponent = iconMap[category] || Folder;
        return <IconComponent className="w-4 h-4" />;
    };

    const getVisibilityIcon = () => {
        return project.visibility === 'public' ?
            <Globe className="w-3 h-3" /> :
            <Lock className="w-3 h-3" />;
    };

    const formatLastActivity = () => {
        const date = project.lastActivityAt || project.updatedAt;
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    if (viewMode === 'list') {
        return (
            <>
                <Card className={cn(
                    "hover:shadow-md transition-shadow border-l-4",
                    project.visibility === 'public' ? "border-l-green-500" : "border-l-blue-500",
                    project.status === 'active' && "bg-green-50/50 dark:bg-green-950/20"
                )}>
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <Link
                                        href={`/workspace/${project.id}`}
                                        className="font-semibold text-lg hover:text-primary transition-colors truncate"
                                    >
                                        {project.name}
                                    </Link>
                                    
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
                                            {getCategoryIcon(project.category)}
                                            <span>{project.category}</span>
                                        </div>

                                        <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                                            {getVisibilityIcon()}
                                            <span className="ml-1">{project.visibility}</span>
                                        </Badge>

                                        {project.status && (
                                            <Badge variant="outline" className="text-xs">
                                                <div className={cn("w-2 h-2 rounded-full mr-1", 
                                                    project.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                                )} />
                                                {project.status}
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {project.description && (
                                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" />
                                            <span>{project.viewCount || 0} views</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{formatLastActivity()}</span>
                                        </div>
                                    </div>

                                    {project.tags && project.tags.length > 0 && (
                                        <div className="flex gap-1">
                                            {project.tags.slice(0, 3).map((tag) => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
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

                            <div className="flex items-center gap-1 ml-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleFavorite}
                                    className="h-8 w-8 p-0"
                                >
                                    {project.isFavorite ?
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> :
                                        <StarOff className="w-4 h-4" />
                                    }
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDuplicate}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isLoading && <ProjectLoadingOverlay isLoading={isLoading} />}
            </>
        );
    }

    // Grid view (default)
    return (
        <>
            <Card className={cn(
                "hover:shadow-lg transition-all duration-200 group cursor-pointer",
                project.status === 'active' && "ring-2 ring-green-500/20"
            )}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-xs">
                            {getCategoryIcon(project.category)}
                            <span className="capitalize">{project.category}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge variant={project.visibility === 'public' ? 'default' : 'secondary'} className="text-xs">
                                {getVisibilityIcon()}
                                <span className="ml-1">{project.visibility}</span>
                            </Badge>

                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleToggleFavorite}
                                    className="h-7 w-7 p-0"
                                >
                                    {project.isFavorite ?
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> :
                                        <StarOff className="w-3 h-3" />
                                    }
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                            <MoreHorizontal className="w-3 h-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                            <Edit2 className="w-4 h-4 mr-2" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDuplicate}>
                                            <Copy className="w-4 h-4 mr-2" />
                                            Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsSettingsModalOpen(true)}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>

                    <Link
                        href={`/workspace/${project.id}`}
                        className="block"
                    >
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                            {project.name}
                        </h3>
                    </Link>

                    {project.description && (
                        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
                            {project.description}
                        </p>
                    )}
                </CardHeader>

                <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            <span>{project.viewCount || 0} views</span>
                        </div>

                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastActivity()}</span>
                        </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {project.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {project.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{project.tags.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isLoading && <ProjectLoadingOverlay isLoading={isLoading} />}

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
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
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                        <SelectItem value="education">Education</SelectItem>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add a tag..."
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTag}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {editedTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {editedTags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ProjectSettingsModal
                projectId={project.id}
                projectName={project.name}
                isOpen={isSettingsModalOpen}
                onOpenChange={setIsSettingsModalOpen}
            />
        </>
    );
}