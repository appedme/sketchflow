"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Search,
    Library,
    Download,
    Star,
    Loader2,
    Image as ImageIcon,
    Plus,
    X,
    ExternalLink
} from 'lucide-react';
import {
    fetchExcalidrawLibraries,
    fetchLibraryItems,
    getLibraryPreviewUrl,
    getDefaultLibraries,
    searchLibraries,
    getPopularLibraries,
    type ExcalidrawLibrary,
    type LibraryItem
} from '@/lib/excalidraw-libraries';
import { cn } from '@/lib/utils';

interface LibraryPanelProps {
    onAddLibraryItems: (items: LibraryItem[]) => void;
    className?: string;
}

export function LibraryPanel({ onAddLibraryItems, className }: LibraryPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [libraries, setLibraries] = useState<ExcalidrawLibrary[]>([]);
    const [filteredLibraries, setFilteredLibraries] = useState<ExcalidrawLibrary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLibrary, setSelectedLibrary] = useState<ExcalidrawLibrary | null>(null);
    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [activeTab, setActiveTab] = useState('popular');

    // Load libraries on mount
    useEffect(() => {
        loadLibraries();
    }, []);

    // Filter libraries based on search
    useEffect(() => {
        if (activeTab === 'popular') {
            setFilteredLibraries(getPopularLibraries(libraries));
        } else if (activeTab === 'search') {
            setFilteredLibraries(searchLibraries(libraries, searchQuery));
        } else {
            setFilteredLibraries(libraries);
        }
    }, [libraries, searchQuery, activeTab]);

    const loadLibraries = async () => {
        setIsLoading(true);
        try {
            const fetchedLibraries = await fetchExcalidrawLibraries();
            setLibraries(fetchedLibraries);
        } catch (error) {
            console.error('Error loading libraries:', error);
            // Fallback to default libraries
            setLibraries(getDefaultLibraries());
        } finally {
            setIsLoading(false);
        }
    };

    const loadLibraryItems = async (library: ExcalidrawLibrary) => {
        setSelectedLibrary(library);
        setIsLoadingItems(true);
        setLibraryItems([]);

        try {
            const items = await fetchLibraryItems(library);
            setLibraryItems(items);
        } catch (error) {
            console.error('Error loading library items:', error);
            setLibraryItems([]);
        } finally {
            setIsLoadingItems(false);
        }
    };

    const handleAddLibrary = (library: ExcalidrawLibrary) => {
        loadLibraryItems(library);
    };

    const handleAddItems = () => {
        if (libraryItems.length > 0) {
            onAddLibraryItems(libraryItems);
            setIsOpen(false);
            setSelectedLibrary(null);
            setLibraryItems([]);
        }
    };

    const handleBackToLibraries = () => {
        setSelectedLibrary(null);
        setLibraryItems([]);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", className)}>
                    <Library className="w-4 h-4" />
                    Libraries
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Library className="w-5 h-5" />
                        {selectedLibrary ? selectedLibrary.name : 'Excalidraw Libraries'}
                    </DialogTitle>
                </DialogHeader>

                {selectedLibrary ? (
                    // Library Items View
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleBackToLibraries}
                                className="gap-2"
                            >
                                ← Back to Libraries
                            </Button>
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {libraryItems.length} items
                                </Badge>
                                <Button
                                    onClick={handleAddItems}
                                    disabled={libraryItems.length === 0 || isLoadingItems}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add to Canvas
                                </Button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm text-muted-foreground">
                                {selectedLibrary.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>By {selectedLibrary.authors.map(a => a.name).join(', ')}</span>
                                <Separator orientation="vertical" className="h-3" />
                                <span>Updated {selectedLibrary.updated}</span>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            {isLoadingItems ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading library items...</p>
                                    </div>
                                </div>
                            ) : libraryItems.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center space-y-4">
                                        <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium text-foreground">No items found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                This library appears to be empty or failed to load.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                    {libraryItems.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="aspect-square border rounded-lg p-2 bg-card hover:shadow-md transition-shadow"
                                        >
                                            <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                ) : (
                    // Libraries List View
                    <div className="flex flex-col h-full">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="popular" className="gap-2">
                                    <Star className="w-4 h-4" />
                                    Popular
                                </TabsTrigger>
                                <TabsTrigger value="search" className="gap-2">
                                    <Search className="w-4 h-4" />
                                    Search
                                </TabsTrigger>
                                <TabsTrigger value="all" className="gap-2">
                                    <Library className="w-4 h-4" />
                                    All
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="search" className="mt-4">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search libraries..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>

                        <ScrollArea className="flex-1 mt-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center space-y-4">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground">Loading libraries...</p>
                                    </div>
                                </div>
                            ) : filteredLibraries.length === 0 ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="text-center space-y-4">
                                        <Search className="w-12 h-12 mx-auto text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium text-foreground">No libraries found</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {searchQuery ? 'Try adjusting your search terms' : 'No libraries available'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3 p-4">
                                    {filteredLibraries.map((library) => (
                                        <LibraryCard
                                            key={library.id}
                                            library={library}
                                            onAdd={() => handleAddLibrary(library)}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Library Card Component
interface LibraryCardProps {
    library: ExcalidrawLibrary;
    onAdd: () => void;
}

function LibraryCard({ library, onAdd }: LibraryCardProps) {
    return (
        <div className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
            {/* Preview Image */}
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                    src={getLibraryPreviewUrl(library)}
                    alt={library.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                    }}
                />
                <ImageIcon className="w-8 h-8 text-muted-foreground hidden" />
            </div>

            {/* Library Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{library.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {library.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>By {library.authors.map(a => a.name).join(', ')}</span>
                            <Separator orientation="vertical" className="h-3" />
                            <span>v{library.version}</span>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        onClick={onAdd}
                        className="gap-2 flex-shrink-0"
                    >
                        <Download className="w-4 h-4" />
                        Add
                    </Button>
                </div>
            </div>
        </div>
    );
}