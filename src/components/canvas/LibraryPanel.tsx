"use client";

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Smile, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LibraryPanelProps {
    onInsertImage?: (imageUrl: string, imageData?: { width: number; height: number }) => void;
    onInsertEmoji?: (emoji: string) => void;
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

export function LibraryPanel({ onInsertImage, onInsertEmoji, onClose }: LibraryPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [pexelsResults, setPexelsResults] = useState<PexelsImage[]>([]);
    const [loadingPexels, setLoadingPexels] = useState(false);
    const [emojiSearch, setEmojiSearch] = useState('');
    
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
                const data = await response.json();
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
            <Tabs defaultValue="images" className="flex-1 flex flex-col">
                <TabsList className="w-full grid grid-cols-2 mx-4 mt-2">
                    <TabsTrigger value="images">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Images
                    </TabsTrigger>
                    <TabsTrigger value="emojis">
                        <Smile className="w-4 h-4 mr-2" />
                        Emojis
                    </TabsTrigger>
                </TabsList>

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
