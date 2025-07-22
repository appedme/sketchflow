'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { DocumentationPanel } from '@/components/project/DocumentationPanel';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface ProjectLayoutProps {
    children: React.ReactNode;
}

export default function ProjectLayout({ children }: ProjectLayoutProps) {
    const params = useParams();
    const pathname = usePathname();
    const projectId = params.id as string;
    const [showDocumentPanel, setShowDocumentPanel] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Check if we're on mobile and handle hydration
    useEffect(() => {
        setMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Get project name from URL or use default
    const getProjectName = () => {
        // You might want to fetch this from an API or context
        return 'Project';
    };

    // Don't show panel on settings page
    const shouldShowPanel = !pathname.includes('/settings');

    if (isMobile || !shouldShowPanel) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen flex bg-background">
            {/* Document Panel - Always visible and persistent */}
            <div className={cn(
                "border-r bg-card flex-shrink-0 overflow-hidden transition-all duration-300",
                showDocumentPanel ? "w-80" : "w-0"
            )}>
                {showDocumentPanel && (
                    <DocumentationPanel
                        projectId={projectId}
                        projectName={getProjectName()}
                        className="h-full"
                    />
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Controls */}
                <div className="flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm z-10">
                    {/* Left side controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDocumentPanel(!showDocumentPanel)}
                            className="gap-2"
                        >
                            {showDocumentPanel ? (
                                <PanelLeftClose className="w-4 h-4" />
                            ) : (
                                <PanelLeftOpen className="w-4 h-4" />
                            )}
                            Files
                        </Button>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-2">
                        {/* Theme toggle button */}
                        {mounted && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="h-8 w-8"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {children}
                </div>
            </div>
        </div>
    );
}