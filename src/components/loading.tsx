"use client";

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LoadingProps {
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    showText?: boolean;
    text?: string;
}

export const Loading = ({
    className,
    size = 'md',
    showText = true,
    text = "Loading..."
}: LoadingProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    return (
        <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
            {/* Logo with subtle animation */}
            <div className="relative">
                <Image
                    src="/logo.svg"
                    alt="SketchFlow Logo"
                    width={size === 'sm' ? 32 : size === 'md' ? 64 : 96}
                    height={size === 'sm' ? 32 : size === 'md' ? 64 : 96}
                    className={cn(
                        "  transition-all duration-300",
                        sizeClasses[size]
                    )}
                    priority
                />


            </div>

            {/* SketchFlow Brand Name */}
            <div className="text-center space-y-3">
                <h1 className={cn(
                    "font-bold tracking-tight bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent font-bitcount-heading",
                    size === 'sm' ? 'text-xl' : size === 'md' ? 'text-3xl' : 'text-4xl'
                )}>
                    SketchFlow
                </h1>

                {/* Loading text and dots */}
                {showText && (
                    <div className="space-y-2">
                        <p className={cn(
                            "font-medium text-muted-foreground animate-pulse",
                            textSizeClasses[size]
                        )}>
                            {text}
                        </p>

                        {/* Animated dots */}
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '0.1s' }}
                            />
                            <div
                                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                                style={{ animationDelay: '0.2s' }}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};