"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Smile, Image as ImageIcon, Loader2, X, Shapes } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibraryPanelProps {
    onInsertImage?: (imageUrl: string, imageData?: { width: number; height: number }) => void;
    onInsertEmoji?: (emoji: string) => void;
    onInsertLibrary?: (libraryItems: any[]) => void;
    onClose?: () => void;
}

interface PexelsImage {
    id: number;
    src: {
        original: string;
        large: string;
        medium: string;
        small: string;
        tiny: string;
    };
    photographer: string;
    photographer_url: string;
    width: number;
    height: number;
}

interface ExcalidrawLibrary {
    id?: string;
    name: string;
    description?: string;
    source?: string;
    preview?: string;
    tags?: string[];
    items?: any[];
}

export function LibraryPanel({ onInsertImage, onInsertEmoji, onInsertLibrary, onClose }: LibraryPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [pexelsResults, setPexelsResults] = useState<PexelsImage[]>([]);
    const [loadingPexels, setLoadingPexels] = useState(false);
    const [emojiSearch, setEmojiSearch] = useState('');
    
    // Excalidraw Libraries state
    const [libraries, setLibraries] = useState<ExcalidrawLibrary[]>([]);
    const [loadingLibraries, setLoadingLibraries] = useState(false);
    const [librarySearch, setLibrarySearch] = useState('');
    const [displayedLibrariesCount, setDisplayedLibrariesCount] = useState(20);

    // Fetch Excalidraw libraries on mount
    useEffect(() => {
        fetchExcalidrawLibraries();
    }, []);

    const fetchExcalidrawLibraries = async () => {
        setLoadingLibraries(true);
        try {
            const response = await fetch('https://libraries.excalidraw.com/libraries.json');
            if (response.ok) {
                const data = await response.json() as { libraries?: ExcalidrawLibrary[] };
                setLibraries(data.libraries || []);
            }
        } catch (error) {
            console.error('Failed to fetch Excalidraw libraries:', error);
        } finally {
            setLoadingLibraries(false);
        }
    };

    // Filter libraries based on search
    const filteredLibraries = libraries.filter((lib) => {
        if (!librarySearch.trim()) return true;
        const searchLower = librarySearch.toLowerCase();
        const nameMatch = lib.name?.toLowerCase().includes(searchLower);
        const descMatch = lib.description?.toLowerCase().includes(searchLower);
        const tagMatch = lib.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        return nameMatch || descMatch || tagMatch;
    });

    // Infinite scroll for libraries
    const displayedLibraries = filteredLibraries.slice(0, displayedLibrariesCount);

    const handleLoadMoreLibraries = useCallback(() => {
        setDisplayedLibrariesCount(prev => prev + 20);
    }, []);

    const handleLibraryClick = async (library: ExcalidrawLibrary) => {
        try {
            // Fetch the library content
            const response = await fetch(library.source || '');
            if (!response.ok) throw new Error('Failed to load library');
            
            const libraryData = await response.json() as { library?: any[]; libraryItems?: any[] };
            
            // Extract library items
            const items = libraryData.library || libraryData.libraryItems || [];
            
            if (items.length > 0) {
                onInsertLibrary?.(items);
            }
        } catch (error) {
            console.error('Failed to load library items:', error);
        }
    };
    
    // Popular OpenMoji categories (these would be loaded from the OpenMoji library)
    const emojiCategories = [
        { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊'] },
        { name: 'Gestures', emojis: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘'] },
        { name: 'Objects', emojis: ['📱', '💻', '🖥', '⌨️', '🖱', '🖨', '📷', '📹', '🎥', '📞', '☎️', '📟'] },
        { name: 'Nature', emojis: ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌴', '🌳', '🌲', '🌱', '🌿', '☘️'] },
    ];

    const searchPexels = useCallback(async (query: string) => {
        if (!query.trim()) return;

        setLoadingPexels(true);
        try {
            const response = await fetch(`/api/images/search?query=${encodeURIComponent(query)}&provider=pexels`);
            if (response.ok) {
                const data = await response.json() as { images?: PexelsImage[] };
                setPexelsResults(data.images || []);
            }
        } catch (error) {
            console.error('Pexels search failed:', error);
        } finally {
            setLoadingPexels(false);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchPexels(searchQuery);
    };

    const handleImageClick = (image: PexelsImage) => {
        onInsertImage?.(image.src.large, {
            width: image.width,
            height: image.height,
        });
    };

    const handleEmojiClick = (emoji: string) => {
        onInsertEmoji?.(emoji);
    };

    return (
        <div className="w-80 h-full bg-background border-l flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
                <h3 className="font-semibold">Library</h3>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="libraries" className="flex-1 flex flex-col">
                <TabsList className="w-full grid grid-cols-3 mx-4 mt-2">
                    <TabsTrigger value="libraries">
                        <Shapes className="w-4 h-4 mr-2" />
                        Libraries
                    </TabsTrigger>
                    <TabsTrigger value="images">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Images
                    </TabsTrigger>
                    <TabsTrigger value="emojis">
                        <Smile className="w-4 h-4 mr-2" />
                        Emojis
                    </TabsTrigger>
                </TabsList>

                {/* Excalidraw Libraries Tab */}
                <TabsContent value="libraries" className="flex-1 flex flex-col px-4 m-0 mt-2">
                    <div className="mb-4">
                        <Input
                            placeholder="Search libraries..."
                            value={librarySearch}
                            onChange={(e) => setLibrarySearch(e.target.value)}
                            className="mb-2"
                        />
                        <p className="text-xs text-muted-foreground">
                            {filteredLibraries.length} libraries available
                        </p>
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-2 gap-3 pb-4">
                            {displayedLibraries.map((library, index) => (
                                <button
                                    key={library.id || index}
                                    onClick={() => handleLibraryClick(library)}
                                    className="relative p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group text-left"
                                >
                                    {/* Preview image if available */}
                                    {library.preview && (
                                        <div className="aspect-video rounded-md overflow-hidden mb-2 bg-muted">
                                            <img
                                                src={library.preview}
                                                alt={library.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Library name */}
                                    <h4 className="font-medium text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                        {library.name}
                                    </h4>
                                    
                                    {/* Description */}
                                    {library.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                            {library.description}
                                        </p>
                                    )}
                                    
                                    {/* Tags */}
                                    {library.tags && library.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {library.tags.slice(0, 3).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Load More Button */}
                        {displayedLibraries.length < filteredLibraries.length && (
                            <div className="flex justify-center pb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLoadMoreLibraries}
                                >
                                    Load More ({filteredLibraries.length - displayedLibraries.length} remaining)
                                </Button>
                            </div>
                        )}

                        {/* Loading state */}
                        {loadingLibraries && (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Loading libraries...</p>
                            </div>
                        )}

                        {/* No results */}
                        {!loadingLibraries && filteredLibraries.length === 0 && librarySearch && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No libraries match your search. Try different keywords.
                            </div>
                        )}

                        {/* Empty state */}
                        {!loadingLibraries && libraries.length === 0 && !librarySearch && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                Failed to load libraries. Please try again.
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* Images Tab */}
                <TabsContent value="images" className="flex-1 flex flex-col px-4 m-0 mt-2">
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <Input
                            placeholder="Search Pexels..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit" size="sm" disabled={loadingPexels}>
                            {loadingPexels ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </form>

                    <ScrollArea className="flex-1">
                        <div className="grid grid-cols-2 gap-2 pb-4">
                            {pexelsResults.map((image) => (
                                <button
                                    key={image.id}
                                    onClick={() => handleImageClick(image)}
                                    className="relative aspect-square rounded-md overflow-hidden hover:opacity-80 transition-opacity group"
                                >
                                    <img
                                        src={image.src.tiny}
                                        alt={`Photo by ${image.photographer}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                        <p className="text-xs text-white truncate">
                                            {image.photographer}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {pexelsResults.length === 0 && !loadingPexels && searchQuery && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                No images found. Try a different search term.
                            </div>
                        )}

                        {pexelsResults.length === 0 && !searchQuery && (
                            <div className="text-center text-sm text-muted-foreground py-8">
                                Search for images from Pexels
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                {/* Emojis Tab */}
                <TabsContent value="emojis" className="flex-1 flex flex-col px-4 m-0 mt-2">
                    <Input
                        placeholder="Search emojis..."
                        value={emojiSearch}
                        onChange={(e) => setEmojiSearch(e.target.value)}
                        className="mb-4"
                    />

                    <ScrollArea className="flex-1">
                        <div className="space-y-4 pb-4">
                            {emojiCategories.map((category) => (
                                <div key={category.name}>
                                    <h4 className="text-xs font-medium text-muted-foreground mb-2">
                                        {category.name}
                                    </h4>
                                    <div className="grid grid-cols-6 gap-2">
                                        {category.emojis
                                            .filter((emoji) =>
                                                emojiSearch ? emoji.includes(emojiSearch) : true
                                            )
                                            .map((emoji, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleEmojiClick(emoji)}
                                                    className="aspect-square rounded-md hover:bg-accent flex items-center justify-center text-2xl transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </div>
    );
}
