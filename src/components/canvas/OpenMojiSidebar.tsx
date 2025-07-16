"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Search,
    Smile,
    Heart,
    Star,
    Zap,
    Palette,
    X,
    Loader2,
    Grid3X3,
    List
} from 'lucide-react';
import { OpenMojiService, OpenMojiIcon } from '@/lib/services/openmoji';
import { cn } from '@/lib/utils';

interface OpenMojiSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onIconSelect: (icon: OpenMojiIcon, style: 'color' | 'black') => void;
    className?: string;
}

export function OpenMojiSidebar({
    isOpen,
    onClose,
    onIconSelect,
    className
}: OpenMojiSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGroup, setSelectedGroup] = useState('');
    const [iconStyle, setIconStyle] = useState<'color' | 'black'>('color');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [isLoading, setIsLoading] = useState(true);
    const [searchResults, setSearchResults] = useState<OpenMojiIcon[]>([]);
    const [popularIcons, setPopularIcons] = useState<OpenMojiIcon[]>([]);
    const [groups, setGroups] = useState<string[]>([]);

    const openMojiService = useMemo(() => OpenMojiService.getInstance(), []);

    // Load OpenMoji data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                await openMojiService.loadIcons();

                // Load initial data
                setPopularIcons(openMojiService.getPopularIcons(50));
                setGroups(openMojiService.getAllGroups());

                // Set initial search results to random popular icons
                const popularIconsData = openMojiService.getPopularIcons(50);
                const randomIcons = [...popularIconsData].sort(() => Math.random() - 0.5).slice(0, 30);
                setSearchResults(randomIcons);
            } catch (error) {
                console.error('Failed to load OpenMoji data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isOpen) {
            loadData();
        }
    }, [isOpen, openMojiService]);

    // Handle search
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);

        if (!query.trim()) {
            // Show random popular icons when no search query
            const randomIcons = [...popularIcons].sort(() => Math.random() - 0.5).slice(0, 30);
            setSearchResults(randomIcons);
            return;
        }

        const results = openMojiService.searchIcons(query, 100);
        setSearchResults(results);
    }, [openMojiService, popularIcons]);

    // Handle group selection
    const handleGroupSelect = useCallback((group: string) => {
        setSelectedGroup(group);
        if (group) {
            const groupIcons = openMojiService.getIconsByGroup(group);
            setSearchResults(groupIcons);
            setSearchQuery('');
        } else {
            setSearchResults(popularIcons);
            setSearchQuery('');
        }
    }, [openMojiService, popularIcons]);

    // Handle icon click
    const handleIconClick = useCallback((icon: OpenMojiIcon) => {
        onIconSelect(icon, iconStyle);
    }, [onIconSelect, iconStyle]);

    // Format group name for display
    const formatGroupName = (group: string) => {
        return group
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    if (!isOpen) return null;

    return (
        <div className={cn(
            "fixed right-0 top-0 h-full w-80 bg-background border-l shadow-xl z-50 flex flex-col",
            className
        )}>
            {/* Header */}
            <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                            <Smile className="w-4 h-4 text-primary" />
                        </div>
                        <h2 className="font-semibold text-sm">OpenMoji Icons</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="h-6 w-6 p-0"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="relative mb-3">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search icons..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-8 h-8 text-sm"
                    />
                </div>

                {/* Style Toggle */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-muted-foreground">Style:</span>
                    <div className="flex gap-1">
                        <Button
                            variant={iconStyle === 'color' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIconStyle('color')}
                            className="h-6 px-2 text-xs"
                        >
                            <Palette className="w-3 h-3 mr-1" />
                            Color
                        </Button>
                        <Button
                            variant={iconStyle === 'black' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setIconStyle('black')}
                            className="h-6 px-2 text-xs"
                        >
                            Black
                        </Button>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">View:</span>
                    <div className="flex gap-1">
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="h-6 w-6 p-0"
                        >
                            <Grid3X3 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="h-6 w-6 p-0"
                        >
                            <List className="w-3 h-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                            <p className="text-sm text-muted-foreground">Loading icons...</p>
                        </div>
                    </div>
                ) : (
                    <Tabs defaultValue="search" className="h-full flex flex-col">
                        <TabsList className="grid w-full grid-cols-2 mx-4 mt-2">
                            <TabsTrigger value="search" className="text-xs">
                                <Search className="w-3 h-3 mr-1" />
                                Search
                            </TabsTrigger>
                            <TabsTrigger value="groups" className="text-xs">
                                <Star className="w-3 h-3 mr-1" />
                                Groups
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="search" className="flex-1 mt-2 overflow-hidden">
                            <ScrollArea className="h-full px-4" style={{ height: 'calc(100vh - 280px)' }}>
                                {searchResults.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Smile className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            {searchQuery ? 'No icons found' : 'Start searching for icons'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        viewMode === 'grid'
                                            ? "grid grid-cols-6 gap-2"
                                            : "space-y-1"
                                    )}>
                                        {searchResults.map((icon) => (
                                            <div
                                                key={icon.hexcode}
                                                className={cn(
                                                    "group cursor-pointer rounded-lg border hover:border-primary/50 hover:bg-accent/50 transition-colors",
                                                    viewMode === 'grid'
                                                        ? "aspect-square p-2 flex flex-col items-center justify-center"
                                                        : "p-2 flex items-center gap-3"
                                                )}
                                                onClick={() => handleIconClick(icon)}
                                                title={icon.annotation}
                                            >
                                                <img
                                                    src={openMojiService.getIconUrl(icon.hexcode, iconStyle)}
                                                    alt={icon.annotation}
                                                    className={cn(
                                                        "object-contain",
                                                        viewMode === 'grid' ? "w-8 h-8" : "w-6 h-6 flex-shrink-0"
                                                    )}
                                                    loading="lazy"
                                                />
                                                {viewMode === 'list' && (
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium truncate">
                                                            {icon.annotation}
                                                        </p>
                                                        {icon.tags && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {icon.tags.split(',').slice(0, 2).join(', ')}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="groups" className="flex-1 mt-2 overflow-hidden">
                            <ScrollArea className="h-full px-4" style={{ height: 'calc(100vh - 280px)' }}>
                                <div className="space-y-1">
                                    <Button
                                        variant={selectedGroup === '' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => handleGroupSelect('')}
                                        className="w-full justify-start h-8 text-xs"
                                    >
                                        <Star className="w-3 h-3 mr-2" />
                                        Popular Icons
                                    </Button>
                                    {groups.map((group) => (
                                        <Button
                                            key={group}
                                            variant={selectedGroup === group ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => handleGroupSelect(group)}
                                            className="w-full justify-start h-8 text-xs"
                                        >
                                            {formatGroupName(group)}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                    Icons by{' '}
                    <a
                        href="https://openmoji.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                    >
                        OpenMoji
                    </a>
                    {' '}• {searchResults.length} icons
                </p>
            </div>
        </div>
    );
}