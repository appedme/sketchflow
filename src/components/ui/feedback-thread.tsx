"use client";

import { ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackThreadProps {
    title?: string;
    description?: string;
    variant?: "default" | "compact" | "minimal";
    className?: string;
}

export function FeedbackThread({
    title = "💬 Join the Feedback Thread",
    description = "We're building with your ideas! Reply here:",
    variant = "default",
    className = ""
}: FeedbackThreadProps) {
    const handleClick = () => {
        window.open("https://x.com/SH20RAJ/status/1947957536659054848", "_blank", "noopener,noreferrer");
    };

    if (variant === "minimal") {
        return (
            <Button
                variant="ghost"
                size="sm"
                onClick={handleClick}
                className={`gap-2 text-sm ${className}`}
            >
                <MessageCircle className="h-4 w-4" />
                Feedback
                <ExternalLink className="h-3 w-3" />
            </Button>
        );
    }

    if (variant === "compact") {
        return (
            <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50 ${className}`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-sm text-slate-900 dark:text-slate-100">{title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{description}</p>
                    </div>
                    <Button
                        onClick={handleClick}
                        size="sm"
                        className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <MessageCircle className="h-4 w-4" />
                        Join
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6 border border-blue-200/50 dark:border-blue-800/50 ${className}`}>
            <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">{description}</p>
                <Button
                    onClick={handleClick}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    <MessageCircle className="h-4 w-4" />
                    Join the Discussion
                    <ExternalLink className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}