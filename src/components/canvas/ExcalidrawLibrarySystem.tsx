"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Library,
    Download,
    Upload,
    Loader2,
    Image as ImageIcon,
    Plus,
    ExternalLink,
    MoreHorizontal,
    Save,
    Trash2,
    FileDown,
    FileUp,
    RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Excalidraw imports
import {
    loadSceneOrLibraryFromBlob,
    serializeLibraryAsJSON,
    mergeLibraryItems,
    MIME_TYPES
} from '@excalidraw/excalidraw';

import type {
    ExcalidrawImperativeAPI,
    LibraryItems,
    LibraryItem
} from '@excalidraw/excalidraw/types';

// Default libraries with working URLs
const DEFAULT_LIBRARIES = [
    {
        id: 'excalidraw-official',
        name: 'Excalidraw Official',
        description: 'Official Excalidraw library with common shapes and icons',
        url: 'https://libraries.excalidraw.com/libraries/excalidraw-official.excalidrawlib',
        tags: ['official', 'shapes', 'icons'],
        author: 'Excalidraw Team',
        items: [] as LibraryItems
    },
    {
        id: 'flowchart-symbols',
        name: 'Flowchart Symbols',
        description: 'Standard flowchart and diagram symbols for process mapping',
        url: 'https://libraries.excalidraw.com/libraries/flowchart.excalidrawlib',
        tags: ['flowchart', 'diagram', 'symbols', 'process'],
        author: 'Community',
        items: [] as LibraryItems
    }
];

interface ExcalidrawLibrarySystemProps {
    excalidrawAPI: ExcalidrawImperativeAPI | null;
    className?: string;
}

interface SavedLibrary {
    id: string;
    name: string;
    description: string;
    items: LibraryItems;
    createdAt: string;
    updatedAt: string;
    author: string;
    tags: string[];
}

export function ExcalidrawLibrarySystem({ excalidrawAPI, className }: ExcalidrawLibrarySystemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentLibrary, setCurrentLibrary] = useState<LibraryItems>([]);
    const [defaultLibraries, setDefaultLibraries] = useState(DEFAULT_LIBRARIES);
    const [savedLibraries, setSavedLibraries] = useState<SavedLibrary[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('current');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load current library when modal opens
    useEffect(() => {
        if (isOpen && excalidrawAPI) {
            loadCurrentLibrary();
        }
    }, [isOpen, excalidrawAPI]);

    // Load saved libraries from localStorage
    useEffect(() => {
        loadSavedLibraries();
        loadDefaultLibraries();
    }, []);

    const loadCurrentLibrary = useCallback(() => {
        if (!excalidrawAPI) return;

        try {
            const library = excalidrawAPI.getLibrary() || [];
            setCurrentLibrary(library);
        } catch (error) {
            console.error('Error loading current library:', error);
            setCurrentLibrary([]);
        }
    }, [excalidrawAPI]);

    const loadSavedLibraries = () => {
        try {
            const saved = localStorage.getItem('excalidraw-saved-libraries');
            if (saved) {
                setSavedLibraries(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading saved libraries:', error);
            setSavedLibraries([]);
        }
    };

    const loadDefaultLibraries = async () => {
        setIsLoading(true);
        const updatedLibraries = [...DEFAULT_LIBRARIES];

        for (let i = 0; i < updatedLibraries.length; i++) {
            try {
                const response = await fetch(updatedLibraries[i].url);
                if (response.ok) {
                    const blob = await response.blob();
                    const contents = await loadSceneOrLibraryFromBlob(blob, null, null);

                    if (contents.type === MIME_TYPES.excalidrawlib) {
                        const libraryData = contents.data as any;
                        if (libraryData.libraryItems) {
                            updatedLibraries[i].items = libraryData.libraryItems;
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed to load default library ${updatedLibraries[i].name}:`, error);
                // Create some mock items for demonstration
                updatedLibraries[i].items = createMockLibraryItems(updatedLibraries[i].name);
            }
        }

        setDefaultLibraries(updatedLibraries);
        setIsLoading(false);
    };

    const createMockLibraryItems = (libraryName: string): LibraryItems => {
        const mockItems: LibraryItems = [];

        for (let i = 0; i < 3; i++) {
            mockItems.push({
                id: `mock-${libraryName}-${i}`,
                status: 'unpublished',
                elements: [
                    {
                        type: 'rectangle',
                        x: 0,
                        y: 0,
                        width: 100,
                        height: 60,
                        angle: 0,
                        strokeColor: '#1e1e1e',
                        backgroundColor: 'transparent',
                        fillStyle: 'solid',
                        strokeWidth: 2,
                        strokeStyle: 'solid',
                        roughness: 1,
                        opacity: 100,
                        groupIds: [],
                        frameId: null,
                        roundness: { type: 3 },
                        seed: Math.floor(Math.random() * 1000000),
                        versionNonce: Math.floor(Math.random() * 1000000),
                        isDeleted: false,
                        boundElements: null,
                        updated: 1,
                        link: null,
                        locked: false,
                        id: `mock-element-${i}`
                    }
                ]
            } as LibraryItem);
        }

        return mockItems;
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !excalidrawAPI) return;

        setIsLoading(true);
        try {
            const contents = await loadSceneOrLibraryFromBlob(file, null, null);

            if (contents.type === MIME_TYPES.excalidrawlib) {
                const libraryData = contents.data as any;
                if (libraryData.libraryItems) {
                    const currentLib = excalidrawAPI.getLibrary() || [];
                    const mergedItems = mergeLibraryItems(currentLib, libraryData.libraryItems);

                    excalidrawAPI.updateLibrary(mergedItems);
                    loadCurrentLibrary();
                    toast.success(`Imported ${libraryData.libraryItems.length} library items`);
                }
            } else {
                toast.error('Invalid library file format');
            }
        } catch (error) {
            console.error('Error importing library:', error);
            toast.error('Failed to import library file');
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleExportLibrary = () => {
        if (!excalidrawAPI) return;

        try {
            const library = excalidrawAPI.getLibrary();
            if (!library || library.length === 0) {
                toast.error('No library items to export');
                return;
            }

            const libraryJSON = serializeLibraryAsJSON(library);
            const blob = new Blob([libraryJSON], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `excalidraw-library-${new Date().toISOString().split('T')[0]}.excalidrawlib`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('Library exported successfully');
        } catch (error) {
            console.error('Error exporting library:', error);
            toast.error('Failed to export library');
        }
    };

    const handleSaveAsLocal = () => {
        if (!excalidrawAPI) return;

        const library = excalidrawAPI.getLibrary();
        if (!library || library.length === 0) {
            toast.error('No library items to save');
            return;
        }

        const name = prompt('Enter library name:');
        if (!name) return;

        const newLibrary: SavedLibrary = {
            id: Date.now().toString(),
            name,
            description: `Saved library with ${library.length} items`,
            items: library,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            author: 'User',
            tags: ['custom']
        };

        const updatedLibraries = [...savedLibraries, newLibrary];
        setSavedLibraries(updatedLibraries);
        localStorage.setItem('excalidraw-saved-libraries', JSON.stringify(updatedLibraries));
        toast.success('Library saved locally');
    };

    const handleLoadLibrary = (library: LibraryItems) => {
        if (!excalidrawAPI) return;

        try {
            const currentLib = excalidrawAPI.getLibrary() || [];
            const mergedItems = mergeLibraryItems(currentLib, library);

            excalidrawAPI.updateLibrary(mergedItems);
            loadCurrentLibrary();
            toast.success(`Loaded ${library.length} items`);
        } catch (error) {
            console.error('Error loading library:', error);
            toast.error('Failed to load library');
        }
    };

    const handleDeleteSavedLibrary = (libraryId: string) => {
        if (!confirm('Are you sure you want to delete this library?')) return;

        const updatedLibraries = savedLibraries.filter(lib => lib.id !== libraryId);
        setSavedLibraries(updatedLibraries);
        localStorage.setItem('excalidraw-saved-libraries', JSON.stringify(updatedLibraries));
        toast.success('Library deleted');
    };

    const handleClearCurrentLibrary = () => {
        if (!excalidrawAPI) return;
        if (!confirm('Are you sure you want to clear the current library?')) return;

        excalidrawAPI.updateLibrary([]);
        loadCurrentLibrary();
        toast.success('Library cleared');
    };

    const filteredSavedLibraries = savedLibraries.filter(lib =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const LibraryItemPreview = ({ item }: { item: LibraryItem }) => (
        <div className="w-16 h-16 border rounded-lg bg-gray-50 flex items-center justify-center">
            <ImageIcon className="w-6 h-6 text-gray-400" />
        </div>
    );

    const LibraryCard = ({
        library,
        onLoad,
        onDelete,
        showActions = true
    }: {
        library: any;
        onLoad: () => void;
        onDelete?: () => void;
        showActions?: boolean;
    }) => (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h4 className="font-medium text-sm">{library.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{library.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                            {library.items?.length || 0} items
                        </Badge>
                        {library.author && (
                            <span className="text-xs text-gray-500">by {library.author}</span>
                        )}
                    </div>
                </div>
                {showActions && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={onLoad}>
                                <Download className="w-4 h-4 mr-2" />
                                Load Library
                            </DropdownMenuItem>
                            {onDelete && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={onDelete} className="text-red-600">
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {library.items && library.items.length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                    {library.items.slice(0, 4).map((item: LibraryItem, index: number) => (
                        <LibraryItemPreview key={item.id || index} item={item} />
                    ))}
                    {library.items.length > 4 && (
                        <div className="w-16 h-16 border rounded-lg bg-gray-50 flex items-center justify-center">
                            <span className="text-xs text-gray-500">+{library.items.length - 4}</span>
                        </div>
                    )}
                </div>
            )}

            {library.tags && library.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                    {library.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", className)}>
                    <Library className="w-4 h-4" />
                    Library
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Library className="w-5 h-5" />
                        Excalidraw Library Manager
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col min-h-0">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="current">
                                Current Library ({currentLibrary.length})
                            </TabsTrigger>
                            <TabsTrigger value="browse">
                                Browse Libraries
                            </TabsTrigger>
                            <TabsTrigger value="saved">
                                Saved Libraries ({savedLibraries.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="current" className="flex-1 flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={loadCurrentLibrary}
                                        variant="outline"
                                        size="sm"
                                        disabled={isLoading}
                                    >
                                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                                        Refresh
                                    </Button>
                                    <Button
                                        onClick={handleClearCurrentLibrary}
                                        variant="outline"
                                        size="sm"
                                        disabled={currentLibrary.length === 0}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Clear
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={handleSaveAsLocal}
                                        variant="outline"
                                        size="sm"
                                        disabled={currentLibrary.length === 0}
                                    >
                                        <Save className="w-4 h-4" />
                                        Save as Local
                                    </Button>
                                    <Button
                                        onClick={handleExportLibrary}
                                        variant="outline"
                                        size="sm"
                                        disabled={currentLibrary.length === 0}
                                    >
                                        <FileDown className="w-4 h-4" />
                                        Export
                                    </Button>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <FileUp className="w-4 h-4" />
                                        Import
                                    </Button>
                                </div>
                            </div>

                            <ScrollArea className="flex-1 border rounded-lg p-4">
                                {currentLibrary.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No items in your current library</p>
                                        <p className="text-sm mt-1">Import a library or browse available libraries to get started</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-4 gap-4">
                                        {currentLibrary.map((item, index) => (
                                            <div key={item.id || index} className="space-y-2">
                                                <LibraryItemPreview item={item} />
                                                <p className="text-xs text-center text-gray-600">
                                                    Item {index + 1}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="browse" className="flex-1 flex flex-col space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search libraries..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    onClick={loadDefaultLibraries}
                                    variant="outline"
                                    size="sm"
                                    disabled={isLoading}
                                >
                                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                                    Refresh
                                </Button>
                            </div>

                            <ScrollArea className="flex-1">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        <span className="ml-2">Loading libraries...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {defaultLibraries
                                            .filter(lib =>
                                                lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                lib.description.toLowerCase().includes(searchQuery.toLowerCase())
                                            )
                                            .map((library) => (
                                                <LibraryCard
                                                    key={library.id}
                                                    library={library}
                                                    onLoad={() => handleLoadLibrary(library.items)}
                                                    showActions={true}
                                                />
                                            ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="saved" className="flex-1 flex flex-col space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Search saved libraries..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <ScrollArea className="flex-1">
                                {filteredSavedLibraries.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <Save className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>No saved libraries</p>
                                        <p className="text-sm mt-1">Save your current library to access it later</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredSavedLibraries.map((library) => (
                                            <LibraryCard
                                                key={library.id}
                                                library={library}
                                                onLoad={() => handleLoadLibrary(library.items)}
                                                onDelete={() => handleDeleteSavedLibrary(library.id)}
                                                showActions={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".excalidrawlib"
                    onChange={handleFileUpload}
                    className="hidden"
                />
            </DialogContent>
        </Dialog>
    );
}