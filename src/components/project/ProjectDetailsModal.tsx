"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Eye,
    FileText,
    Palette,
    Calendar,
    User,
    Globe,
    Lock,
    Clock,
    Activity,
    Loader2,
    TrendingUp
} from "lucide-react";
import { useApi } from '@/hooks/shared/useApi';
import { formatDistanceToNow, format } from 'date-fns';

interface ProjectDetailsModalProps {
    projectId: string;
    projectName: string;
    children?: React.ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
}



export function ProjectDetailsModal({
    projectId,
    projectName,
    children,
    isOpen: externalIsOpen,
    onOpenChange: externalOnOpenChange,
}: ProjectDetailsModalProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Use external state if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const setIsOpen = externalOnOpenChange || setInternalIsOpen;

    // Fetch project data
    const { data: project, isLoading: projectLoading } = useApi(
        isOpen ? `/api/projects/${projectId}` : null
    );

    // Fetch project statistics
    const { data: stats, isLoading: statsLoading } = useApi(
        isOpen ? `/api/projects/${projectId}/stats` : null
    );

    // Fetch documents and canvases count
    const { data: documents } = useApi(
        isOpen ? `/api/projects/${projectId}/documents` : null
    );

    const { data: canvases } = useApi(
        isOpen ? `/api/projects/${projectId}/canvases` : null
    );

    const isLoading = projectLoading || statsLoading;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {children && (
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Project Overview
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span>Loading project details...</span>
                        </div>
                    ) : (
                        <>
                            {/* Project Basic Info */}
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold">{projectName}</h3>
                                    {project?.description && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {project.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 flex-wrap">
                                    <Badge variant={project?.visibility === 'public' ? "default" : "secondary"} className="gap-1">
                                        {project?.visibility === 'public' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                                        {project?.visibility === 'public' ? "Public" : "Private"}
                                    </Badge>

                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        Created {project?.createdAt ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) : 'Unknown'}
                                    </div>

                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        Updated {project?.updatedAt ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }) : 'Unknown'}
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* View Statistics */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    View Statistics
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Eye className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">Total Views</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {stats?.viewCount || 0}
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Activity className="w-4 h-4 text-green-500" />
                                            <span className="text-sm font-medium">Last Activity</span>
                                        </div>
                                        <div className="text-sm font-medium">
                                            {stats?.lastActivityAt
                                                ? formatDistanceToNow(new Date(stats.lastActivityAt), { addSuffix: true })
                                                : 'No activity'
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Content Statistics */}
                            <div className="space-y-4">
                                <h4 className="font-medium flex items-center gap-2">
                                    <Activity className="w-4 h-4" />
                                    Content Overview
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm font-medium">Documents</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {documents?.length || 0}
                                        </div>
                                    </div>

                                    <div className="bg-muted/50 p-4 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Palette className="w-4 h-4 text-purple-500" />
                                            <span className="text-sm font-medium">Canvases</span>
                                        </div>
                                        <div className="text-2xl font-bold">
                                            {canvases?.length || 0}
                                        </div>
                                    </div>
                                </div>
                            </div>



                            {/* Project Details */}
                            <Separator />
                            <div className="space-y-3">
                                <h4 className="font-medium">Project Details</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Project ID:</span>
                                        <span className="font-mono text-xs">{projectId}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Owner:</span>
                                        <span>{project?.ownerEmail || 'Unknown'}</span>
                                    </div>
                                    {project?.createdAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Created:</span>
                                            <span>{format(new Date(project.createdAt), 'PPP')}</span>
                                        </div>
                                    )}
                                    {project?.updatedAt && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Last Modified:</span>
                                            <span>{format(new Date(project.updatedAt), 'PPP')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}