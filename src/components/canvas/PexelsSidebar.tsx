'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, X, Download } from 'lucide-react';
import { PexelsService, PexelsPhoto } from '@/lib/services/pexels';

interface PexelsSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect: (photo: PexelsPhoto) => void;
}

export function PexelsSidebar({ isOpen, onClose, onImageSelect }: PexelsSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalResults, setTotalResults] = useState(0);

    const pexelsService = PexelsService.getInstance();

    const searchPhotos = useCallback(async (query: string, pageNum: number = 1, append: boolean = false) => {
        if (!query.trim() && pageNum === 1) {
            // Load curated photos if no search query
            try {
                setLoading(true);
                const response = await pexelsService.getCuratedPhotos(pageNum, 20);

                if (append) {
                    setPhotos(prev => [...prev, ...response.photos]);
                } else {
                    setPhotos(response.photos);
                }

                setTotalResults(response.total_results);
                setHasMore(response.photos.length === 20);
                setPage(pageNum);
            } catch (error) {
                console.error('Error loading curated photos:', error);
            } finally {
                setLoading(false);
            }
            return;
        }

        if (!query.trim()) return;

        try {
            setLoading(true);
            const response = await pexelsService.searchPhotos(query, pageNum, 20);

            if (append) {
                setPhotos(prev => [...prev, ...response.photos]);
            } else {
                setPhotos(response.photos);
            }

            setTotalResults(response.total_results);
            setHasMore(response.photos.length === 20);
            setPage(pageNum);
        } catch (error) {
            console.error('Error searching photos:', error);
        } finally {
            setLoading(false);
        }
    }, [pexelsService]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        setPage(1);
        searchPhotos(query, 1, false);
    }, [searchPhotos]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            searchPhotos(searchQuery, page + 1, true);
        }
    }, [searchPhotos, searchQuery, page, loading, hasMore]);

    const handleImageClick = useCallback((photo: PexelsPhoto) => {
        onImageSelect(photo);
    }, [onImageSelect]);

    // Load curated photos on mount
    useEffect(() => {
        if (isOpen && photos.length === 0) {
            searchPhotos('', 1, false);
        }
    }, [isOpen, photos.length, searchPhotos]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-gray-200 shadow-lg z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    <h2 className="text-lg font-semibold">Pexels Images</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search for images..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(searchQuery);
                            }
                        }}
                        className="pl-10"
                    />
                </div>
                <Button
                    onClick={() => handleSearch(searchQuery)}
                    className="w-full mt-2"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Searching...
                        </>
                    ) : (
                        'Search'
                    )}
                </Button>
            </div>

            {/* Results Info */}
            {totalResults > 0 && (
                <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                    {totalResults.toLocaleString()} images found
                </div>
            )}

            {/* Images Grid */}
            <ScrollArea className="flex-1 p-4">
                <div className="grid grid-cols-2 gap-3">
                    {photos.map((photo) => (
                        <div
                            key={photo.id}
                            className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-blue-300 transition-colors"
                            onClick={() => handleImageClick(photo)}
                        >
                            <img
                                src={photo.src.small}
                                alt={photo.alt}
                                className="w-full h-24 object-cover"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                                <Download className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                                <p className="text-xs text-white truncate">
                                    by {photo.photographer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {hasMore && photos.length > 0 && (
                    <div className="mt-4 text-center">
                        <Button
                            variant="outline"
                            onClick={loadMore}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                'Load More'
                            )}
                        </Button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && photos.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-gray-500">
                        <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No images found for "{searchQuery}"</p>
                        <p className="text-sm mt-1">Try a different search term</p>
                    </div>
                )}
            </ScrollArea>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
                Images provided by{' '}
                <a
                    href="https://www.pexels.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                >
                    Pexels
                </a>
            </div>
        </div>
    );
}