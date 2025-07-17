"use client";

import { Toaster as SonnerToaster } from "sonner";

interface ToasterProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "top-center" | "bottom-center";
    closeButton?: boolean;
    theme?: "light" | "dark" | "system";
    richColors?: boolean;
    expand?: boolean;
    duration?: number;
    className?: string;
    style?: React.CSSProperties;
    visibleToasts?: number;
    toastOptions?: Record<string, unknown>;
    offset?: string | number;
    gap?: number;
}

export function Toaster({
    position = "bottom-right",
    closeButton = true,
    theme = "system",
    richColors = false,
    expand = false,
    duration = 4000,
    className,
    style,
    visibleToasts = 3,
    toastOptions,
    offset,
    gap = 8,
}: ToasterProps) {
    return (
        <SonnerToaster
            position={position}
            closeButton={closeButton}
            theme={theme}
            richColors={richColors}
            expand={expand}
            duration={duration}
            className={className}
            style={style}
            visibleToasts={visibleToasts}
            toastOptions={toastOptions}
            offset={offset}
            gap={gap}
        />
    );
}