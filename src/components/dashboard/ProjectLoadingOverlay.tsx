"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ProjectLoadingOverlayProps {
    isLoading: boolean;
}

export function ProjectLoadingOverlay({ isLoading }: ProjectLoadingOverlayProps) {
    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className=" bg-background rounded-xl p-6 shadow-2xl flex flex-col items-center">
                <div className="  mb-4">
                    <Image
                        src="/logo.svg"
                        alt="Loading"
                        width={80}
                        height={80}
                        className="animate-pulse"
                    />
                </div>
                <p className="text-slate-600 animate-pulse">Opening project...</p>
            </div>
        </div>
    );
}