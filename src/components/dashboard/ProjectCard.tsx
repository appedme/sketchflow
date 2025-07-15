"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    ExternalLink
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
    onToggleFavorite?: (projectId: string) => void;
    onDelete?: (projectId: string) => void;
}

export function ProjectCard({
    project,
    viewMode = 'list',
    onToggleFavorite,
    onDelete
}: ProjectCardProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onToggleFavorite) {
            setIsLoading(true);
            try {
                await onToggleFavorite(project.id);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (onDelete && confirm('Are you sure you want to delete this project?')) {
            await onDelete(project.id);
        }
    };

    if (viewMode === 'grid') {
        return (
            <Card className="group hover:shadow-md transition-all duration-200 border-border bg-card">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                                onClick={handleToggleFavorite}
                                disabled={isLoading}
                            >
                                {project.isFavorite ? (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                ) : (
                                    <StarOff className="w-4 h-4 text-muted-foreground" />
                                )}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                                    >
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/project/${project.id}`} >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
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
                        </div>
                    </div>

                    <Link href={`/project/${project.id}`} className="block" >
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
        );
    }

    // List view
    return (
        <Card className="group hover:shadow-sm transition-all duration-200 border-border bg-card">
            <CardContent className="p-4">
                <Link href={`/project/${project.id}`} className="block" >
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="p-2">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/project/${project.id}`} >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            Open
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Edit2 className="w-4 h-4 mr-2" />
                                        Edit
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
                        </div>
                    </div>
                </Link>
            </CardContent>
        </Card>
    );
}