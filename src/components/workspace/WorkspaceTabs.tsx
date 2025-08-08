"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useWorkspaceStore } from '@/lib/stores/useWorkspaceStore';
import { Button } from '@/components/ui/button';
import { X, FileText, PencilRuler, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function WorkspaceTabs() {
    const router = useRouter();
    const params = useParams();
    const projectId = params.projectId as string;

    const {
        openFiles,
        activeFileId,
        setActiveFile,
        closeFile
    } = useWorkspaceStore();

    const openFilesList = Object.values(openFiles);

    const handleTabClick = (fileId: string) => {
        setActiveFile(fileId);
        router.push(`/workspace/${projectId}/${fileId}`, { scroll: false });
    };

    const handleCloseTab = (e: React.MouseEvent, fileId: string) => {
        e.stopPropagation();
        closeFile(fileId);

        // Navigate to another open file or back to project
        const remainingFiles = Object.keys(openFiles).filter(id => id !== fileId);
        if (remainingFiles.length > 0) {
            const nextFileId = remainingFiles[0];
            setActiveFile(nextFileId);
            router.push(`/workspace/${projectId}/${nextFileId}`, { scroll: false });
        } else {
            router.push(`/project/${projectId}`, { scroll: false });
        }
    };

    if (openFilesList.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 overflow-x-auto">
            {openFilesList.map((file) => {
                const isActive = file.id === activeFileId;
                const Icon = file.type === 'canvas' ? PencilRuler : FileText;

                return (
                    <div
                        key={file.id}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1 rounded-md text-sm cursor-pointer transition-colors group",
                            "border border-transparent hover:bg-muted/50",
                            isActive && "bg-background border-border shadow-sm"
                        )}
                        onClick={() => handleTabClick(file.id)}
                    >
                        <Icon className={cn(
                            "w-3 h-3",
                            file.type === 'canvas' ? "text-purple-500" : "text-blue-500"
                        )} />

                        <span className="truncate max-w-[120px]">
                            {file.title}
                        </span>

                        {file.isDirty && (
                            <Circle className="w-2 h-2 fill-orange-500 text-orange-500" />
                        )}

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleCloseTab(e, file.id)}
                            className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}