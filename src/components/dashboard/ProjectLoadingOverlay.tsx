"use client";

import { Loading } from "@/components/ui/loading";

interface ProjectLoadingOverlayProps {
    isLoading: boolean;
}

export function ProjectLoadingOverlay({ isLoading }: ProjectLoadingOverlayProps) {
    if (1) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-background rounded-xl p-8 shadow-2xl">
                <Loading size="md" text="Opening project..." />
            </div>
        </div>
    );
}