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
} from '@/hooks/useProjects';
import './ProjectCard.css';

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

    // Settings modal state
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
        return <IconComponent className="project-card__category-icon" />;
    };

    const getVisibilityIcon = () => {
        return project.visibility === 'public' ?
            <Globe className="project-card__visibility-icon" /> :
            <Lock className="project-card__visibility-icon" />;
    };

    const formatLastActivity = () => {
        const date = project.lastActivityAt || project.updatedAt;
        return formatDistanceToNow(new Date(date), { addSuffix: true });
    };

    if (viewMode === 'list') {
        return (
            <>
                <Card className={cn(
                    "project-card project-card--list",
                    project.visibility === 'public' && "project-card--public",
                    project.status === 'active' && "project-card--active"
                )}>
                    <CardContent className="project-card__content project-card__content--list">
                        <div className="project-card__main">
                            <div className="project-card__header">
                                <div className="project-card__title-section">
                                    <Link
                                        href={`/project/${project.id}`}
                                        className="project-card__title-link"
                                    >
                                        <h3 className="project-card__title">{project.name}</h3>
                                    </Link>
                                    <div className="project-card__meta">
                                        {getCategoryIcon(project.category)}
                                        <span className="project-card__category">{project.category}</span>

                                        {/* Visibility Badge - Always Visible */}
                                        <div className={cn(
                                            "project-card__visibility-badge project-card__visibility-badge--compact",
                                            project.visibility === 'public' && "project-card__visibility-badge--public"
                                        )}>
                                            {getVisibilityIcon()}
                                            <span className="project-card__visibility-text">{project.visibility}</span>
                                        </div>

                                        {/* Status Badge - Always Visible */}
                                        {project.status && (
                                            <div className={cn(
                                                "project-card__status-badge project-card__status-badge--compact",
                                                `project-card__status-badge--${project.status}`
                                            )}>
                                                <div className="project-card__status-dot" />
                                                <span className="project-card__status-text">{project.status}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="project-card__actions">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleToggleFavorite}
                                        className="project-card__favorite-btn"
                                    >
                                        {project.isFavorite ?
                                            <Star className="project-card__star project-card__star--filled" /> :
                                            <StarOff className="project-card__star" />
                                        }
                                    </Button>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="project-card__menu-btn">
                                                <MoreHorizontal className="project-card__menu-icon" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="project-card__dropdown">
                                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                <Edit2 className="project-card__dropdown-icon" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleDuplicate}>
                                                <Copy className="project-card__dropdown-icon" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <ProjectSettingsModal
                                                projectId={project.id}
                                                projectName={project.name}
                                                isOpen={isSettingsModalOpen}
                                                onOpenChange={setIsSettingsModalOpen}
                                                trigger={
                                                    <DropdownMenuItem
                                                        onSelect={(e) => e.preventDefault()}
                                                    >
                                                        <Settings className="project-card__dropdown-icon" />
                                                        Settings
                                                    </DropdownMenuItem>
                                                }
                                            />
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleDelete} className="project-card__delete-item">
                                                <Trash2 className="project-card__dropdown-icon" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {project.description && (
                                <p className="project-card__description">{project.description}</p>
                            )}

                            <div className="project-card__footer">
                                <div className="project-card__stats">
                                    <div className="project-card__stat">
                                        <Eye className="project-card__stat-icon" />
                                        <span className="project-card__stat-text">{project.viewCount || 0} views</span>
                                    </div>
                                    <div className="project-card__stat">
                                        <Clock className="project-card__stat-icon" />
                                        <span className="project-card__stat-text">{formatLastActivity()}</span>
                                    </div>
                                </div>

                                {project.tags && project.tags.length > 0 && (
                                    <div className="project-card__tags">
                                        {project.tags.slice(0, 3).map((tag) => (
                                            <Badge key={tag} variant="secondary" className="project-card__tag">
                                                {tag}
                                            </Badge>
                                        ))}
                                        {project.tags.length > 3 && (
                                            <Badge variant="outline" className="project-card__tag project-card__tag--more">
                                                +{project.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {isLoading && <ProjectLoadingOverlay isLoading={isLoading} />}

                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogContent className="project-card__edit-dialog">
                        <DialogHeader>
                            <DialogTitle>Edit Project</DialogTitle>
                        </DialogHeader>
                        <div className="project-card__edit-form">
                            <div className="project-card__form-group">
                                <Label htmlFor="name">Project Name</Label>
                                <Input
                                    id="name"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="project-card__form-input"
                                />
                            </div>

                            <div className="project-card__form-group">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    className="project-card__form-textarea"
                                    rows={3}
                                />
                            </div>

                            <div className="project-card__form-row">
                                <div className="project-card__form-group">
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={editedCategory} onValueChange={setEditedCategory}>
                                        <SelectTrigger className="project-card__form-select">
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

                                <div className="project-card__form-group">
                                    <Label htmlFor="visibility">Visibility</Label>
                                    <Select value={editedVisibility} onValueChange={setEditedVisibility}>
                                        <SelectTrigger className="project-card__form-select">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="private">Private</SelectItem>
                                            <SelectItem value="public">Public</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="project-card__form-group">
                                <Label>Tags</Label>
                                <div className="project-card__tags-input">
                                    <Input
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                        placeholder="Add a tag..."
                                        className="project-card__tag-input"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addTag}
                                        className="project-card__add-tag-btn"
                                    >
                                        <Plus className="project-card__add-tag-icon" />
                                    </Button>
                                </div>

                                {editedTags.length > 0 && (
                                    <div className="project-card__current-tags">
                                        {editedTags.map((tag) => (
                                            <Badge key={tag} variant="secondary" className="project-card__current-tag">
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="project-card__remove-tag-btn"
                                                >
                                                    <X className="project-card__remove-tag-icon" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="project-card__form-actions">
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
            </>
        );
    }

    // Grid view (default)
    return (
        <>
            <Card className={cn(
                "project-card project-card--grid",
                // project.visibility === 'public' && "project-card--public",
                project.status === 'active' && "project-card--active"
            )}>
                <CardHeader className="project-card__header">
                    <div className="project-card__header-top">
                        <div className="project-card__category-badge">
                            {getCategoryIcon(project.category)}
                            <span className="project-card__category-text">{project.category}</span>
                        </div>

                        <div className="project-card__status-indicators">
                            {/* Visibility Badge - Always Visible */}
                            <div className={cn(
                                "project-card__visibility-badge",
                                project.visibility === 'public' && "project-card__visibility-badge--public"
                            )}>
                                {getVisibilityIcon()}
                                <span className="project-card__visibility-text">{project.visibility}</span>
                            </div>

                            {/* Status Badge - Always Visible */}
                            {/* {project.status && (
                                <div className={cn(
                                    "project-card__status-badge",
                                    `project-card__status-badge--${project.status}`
                                )}>
                                    <div className="project-card__status-dot" />
                                    <span className="project-card__status-text">{project.status}</span>
                                </div>
                            )} */}
                        </div>

                        <div className="project-card__header-actions">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleToggleFavorite}
                                className="project-card__favorite-btn"
                            >
                                {project.isFavorite ?
                                    <Star className="project-card__star project-card__star--filled" /> :
                                    <StarOff className="project-card__star" />
                                }
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="project-card__menu-btn">
                                        <MoreHorizontal className="project-card__menu-icon" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="project-card__dropdown">
                                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                        <Edit2 className="project-card__dropdown-icon" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleDuplicate}>
                                        <Copy className="project-card__dropdown-icon" />
                                        Duplicate
                                    </DropdownMenuItem>
                                    <ProjectSettingsModal
                                        projectId={project.id}
                                        projectName={project.name}
                                        isOpen={isSettingsModalOpen}
                                        onOpenChange={setIsSettingsModalOpen}
                                        trigger={
                                            <DropdownMenuItem
                                                onSelect={(e) => e.preventDefault()}
                                            >
                                                <Settings className="project-card__dropdown-icon" />
                                                Settings
                                            </DropdownMenuItem>
                                        }
                                    />
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleDelete} className="project-card__delete-item">
                                        <Trash2 className="project-card__dropdown-icon" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Link
                        href={`/project/${project.id}`}
                        className="project-card__title-link"
                    >
                        <h3 className="project-card__title">{project.name}</h3>
                    </Link>

                    {project.description && (
                        <p className="project-card__description">{project.description}</p>
                    )}
                </CardHeader>

                <CardContent className="project-card__content">
                    <div className="project-card__footer">
                        <div className="project-card__stats">
                            <div className="project-card__stat">
                                <Eye className="project-card__stat-icon" />
                                <span className="project-card__stat-text">{project.viewCount || 0} views</span>
                            </div>
                        </div>

                        <div className="project-card__activity">
                            <Clock className="project-card__activity-icon" />
                            <span className="project-card__activity-text">{formatLastActivity()}</span>
                        </div>
                    </div>

                    {project.tags && project.tags.length > 0 && (
                        <div className="project-card__tags">
                            {project.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="secondary" className="project-card__tag">
                                    {tag}
                                </Badge>
                            ))}
                            {project.tags.length > 2 && (
                                <Badge variant="outline" className="project-card__tag project-card__tag--more">
                                    +{project.tags.length - 2}
                                </Badge>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {isLoading && <ProjectLoadingOverlay isLoading={isLoading} />}

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="project-card__edit-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <div className="project-card__edit-form">
                        <div className="project-card__form-group">
                            <Label htmlFor="name">Project Name</Label>
                            <Input
                                id="name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="project-card__form-input"
                            />
                        </div>

                        <div className="project-card__form-group">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                className="project-card__form-textarea"
                                rows={3}
                            />
                        </div>

                        <div className="project-card__form-row">
                            <div className="project-card__form-group">
                                <Label htmlFor="category">Category</Label>
                                <Select value={editedCategory} onValueChange={setEditedCategory}>
                                    <SelectTrigger className="project-card__form-select">
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

                            <div className="project-card__form-group">
                                <Label htmlFor="visibility">Visibility</Label>
                                <Select value={editedVisibility} onValueChange={setEditedVisibility}>
                                    <SelectTrigger className="project-card__form-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="private">Private</SelectItem>
                                        <SelectItem value="public">Public</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="project-card__form-group">
                            <Label>Tags</Label>
                            <div className="project-card__tags-input">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="Add a tag..."
                                    className="project-card__tag-input"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTag}
                                    className="project-card__add-tag-btn"
                                >
                                    <Plus className="project-card__add-tag-icon" />
                                </Button>
                            </div>

                            {editedTags.length > 0 && (
                                <div className="project-card__current-tags">
                                    {editedTags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="project-card__current-tag">
                                            {tag}
                                            <button
                                                onClick={() => removeTag(tag)}
                                                className="project-card__remove-tag-btn"
                                            >
                                                <X className="project-card__remove-tag-icon" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="project-card__form-actions">
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
        </>
    );
}