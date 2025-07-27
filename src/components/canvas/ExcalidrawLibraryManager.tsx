"use client";

import { useState, useEffect, useCallback } from 'react';
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
    Star,
    Loader2,
    Image as ImageIcon,
    Plus,
    X,
    ExternalLink,
    MoreHorizontal,
    Save,
    Trash2,
    Share2,
    FileDown,
    FileUp
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Excalidraw imports for library management
import {
    loadLibraryFromBlob,
    loadSceneOrLibraryFromBlob,
    serializeLibraryAsJSON,
    mergeLibraryItems,
    parseLibraryTokensFromUrl,
    useHandleLibrary,
    MIME_TYPES
} from '@excalidraw/excalidraw';

import type {
    ExcalidrawImperativeAPI,
    LibraryItems,
    LibraryItem
} from '@excalidraw/excalidraw/types';

interface ExcalidrawLibraryManagerProps {
    excalidrawAPI: ExcalidrawImperativeAPI | null;
    className?: string;
}

interface LocalLibrary {
    id: string;
    name: string;
    description: string;
    items: LibraryItems;
    createdAt: string;
    updatedAt: string;
}

export function ExcalidrawLibraryManager({ excalidrawAPI, className }: ExcalidrawLibraryManagerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [localLibraries, setLocalLibraries] = useState<LocalLibrary[]>([]);
    const [currentLibrary, setCurrentLibrary] = useState<LibraryItems>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('current');

    // Handle library URL imports
    useHandleLibrary({
        excalidrawAPI: excalidrawAPI!,
        getInitialLibraryItems: () => {
            // Load from localStorage or return empty
            const saved = localStorage.getItem('excalidraw-library');
            return saved ? JSON.parse(saved) : [];
        }
    });

    // Load current library from Excalidraw
    useEffect(() => {
        if (excalidrawAPI && isOpen) {
            loadCurrentLibrary();
        }
    }, [excalidrawAPI, isOpen]);

    // Load local libraries from storage
    useEffect(() => {
        loadLocalLibraries();
    }, []);

    const loadCurrentLibrary = useCallback(() => {
        if (!excalidrawAPI) return;

        try {
            // Get current library from Excalidraw
            const library = excalidrawAPI.getLibrary();
            setCurrentLibrary(library || []);
        } catch (error) {
            console.error('Error loading current library:', error);
            setCurrentLibrary([]);
        }
    }, [excalidrawAPI]);

    const loadLocalLibraries = () => {
        try {
            const saved = localStorage.getItem('excalidraw-local-libraries');
            if (saved) {
                setLocalLibraries(JSON.parse(saved));
            }
        } catch (error) {
            console.error('Error loading local libraries:', error);
            setLocalLibraries([]);
        }
    };

    const saveLocalLibraries = (libraries: LocalLibrary[]) => {
        try {
            localStorage.setItem('excalidraw-local-libraries', JSON.stringify(libraries));
            setLocalLibraries(libraries);
        } catch (error) {
            console.error('Error saving local libraries:', error);
            toast.error('Failed to save libraries');
        }
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
                    // Merge with current library
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
            event.target.value = '';
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

        const newLibrary: LocalLibrary = {
            id: Date.now().toString(),
            name,
            description: `Saved library with ${library.length} items`,
            items: library,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const updatedLibraries = [...localLibraries, newLibrary];
        saveLocalLibraries(updatedLibraries);
        toast.success('Library saved locally');
    };

    const handleLoadLocalLibrary = (library: LocalLibrary) => {
        if (!excalidrawAPI) return;

        try {
            const currentLib = excalidrawAPI.getLibrary() || [];
            const mergedItems = mergeLibraryItems(currentLib, library.items);

            excalidrawAPI.updateLibrary(mergedItems);
            loadCurrentLibrary();
            toast.success(`Loaded ${library.items.length} items from ${library.name}`);
        } catch (error) {
            console.error('Error loading local library:', error);
            toast.error('Failed to load library');
        }
    };

    const handleDeleteLocalLibrary = (libraryId: string) => {
        if (!confirm('Are you sure you want to delete this library?')) return;

        const updatedLibraries = localLibraries.filter(lib => lib.id !== libraryId);
        saveLocalLibraries(updatedLibraries);
        toast.success('Library deleted');
    };

    const handleClearCurrentLibrary = () => {
        if (!excalidrawAPI) return;
        if (!confirm('Are you sure you want to clear the current library?')) return;

        excalidrawAPI.updateLibrary([]);
        loadCurrentLibrary();
        toast.success('Library cleared');
    };

    const handleAddFromURL = () => {
        const url = prompt('Enter library URL:');
        if (!url) return;

        // Add #addLibrary to current URL to trigger library import
        const currentUrl = new URL(window.location.href);
        currentUrl.hash = `addLibrary=${encodeURIComponent(url)}`;
        window.location.href = currentUrl.toString();
    };

    const filteredLibraries = localLibraries.filter(lib =>
        lib.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lib.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className={cn("gap-2", className)}>
                    <Library className="w-4 h-4" />
                    Library Manager
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Library className="w-5 h-5" />
                        Library Manager
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col h-full">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="current" className="gap-2">
                                <Library className="w-4 h-4" />
                                Current ({currentLibrary.length})
                            </TabsTrigger>
                            <TabsTrigger value="local" className="gap-2">
                                <Save className="w-4 h-4" />
                                Saved ({localLibraries.length})
                            </TabsTrigger>
                            <TabsTrigger value="import" className="gap-2">
                                <Download className="w-4 h-4" />
                                Import
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="current" className="mt-4 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary">
                                        {currentLibrary.length} items
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleSaveAsLocal}
                                        disabled={currentLibrary.length === 0}
                                        className="gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleExportLibrary}
                                        disabled={currentLibrary.length === 0}
                                        className="gap-2"
                                    >
                                        <FileDown className="w-4 h-4" />
                                        Export
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={handleClearCurrentLibrary}
                                                disabled={currentLibrary.length === 0}
                                                className="text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Clear Library
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                {currentLibrary.length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center space-y-4">
                                            <Library className="w-12 h-12 mx-auto text-muted-foreground" />
                                            <div>
                                                <h3 className="font-medium text-foreground">No library items</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Import a library or create items to get started
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
                                        {currentLibrary.map((item, index) => (
                                            <div
                                                key={index}
                                                className="aspect-square border rounded-lg p-2 bg-card hover:shadow-md transition-shadow cursor-pointer"
                                                onClick={() => {
                                                    if (excalidrawAPI) {
                                                        // Add item to canvas
                                                        excalidrawAPI.addElementsFromLibrary([item]);
                                                        toast.success('Added to canvas');
                                                    }
                                                }}
                                            >
                                                <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                                                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="local" className="mt-4 flex-1">
                            <div className="flex items-center justify-between mb-4">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                    <Input
                                        placeholder="Search saved libraries..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                {filteredLibraries.length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="text-center space-y-4">
                                            <Save className="w-12 h-12 mx-auto text-muted-foreground" />
                                            <div>
                                                <h3 className="font-medium text-foreground">No saved libraries</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Save your current library to access it later
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 p-4">
                                        {filteredLibraries.map((library) => (
                                            <div
                                                key={library.id}
                                                className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow"
                                            >
                                                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <Library className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-foreground truncate">{library.name}</h3>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                                        {library.description}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                        <span>{library.items.length} items</span>
                                                        <Separator orientation="vertical" className="h-3" />
                                                        <span>Saved {new Date(library.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleLoadLocalLibrary(library)}
                                                        className="gap-2"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Load
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteLocalLibrary(library.id)}
                                                                className="text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="import" className="mt-4 flex-1">
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="border rounded-lg p-6 text-center space-y-4">
                                        <FileUp className="w-12 h-12 mx-auto text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium text-foreground">Import from File</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Upload an .excalidrawlib file
                                            </p>
                                        </div>
                                        <div>
                                            <input
                                                type="file"
                                                accept=".excalidrawlib,.json"
                                                onChange={handleFileUpload}
                                                className="hidden"
                                                id="library-upload"
                                                disabled={isLoading}
                                            />
                                            <Button
                                                asChild
                                                disabled={isLoading}
                                                className="gap-2"
                                            >
                                                <label htmlFor="library-upload" className="cursor-pointer">
                                                    {isLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="w-4 h-4" />
                                                    )}
                                                    Choose File
                                                </label>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg p-6 text-center space-y-4">
                                        <ExternalLink className="w-12 h-12 mx-auto text-muted-foreground" />
                                        <div>
                                            <h3 className="font-medium text-foreground">Import from URL</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Load a library from a web URL
                                            </p>
                                        </div>
                                        <Button
                                            onClick={handleAddFromURL}
                                            className="gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add URL
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-4 bg-muted/50">
                                    <h4 className="font-medium text-foreground mb-2">Popular Libraries</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Quick access to commonly used Excalidraw libraries
                                    </p>
                                    <div className="space-y-2">
                                        {[
                                            { name: 'Excalidraw Official', url: 'https://libraries.excalidraw.com/libraries/excalidraw-official.excalidrawlib' },
                                            { name: 'UI Components', url: 'https://libraries.excalidraw.com/libraries/ui-components.excalidrawlib' },
                                            { name: 'Flowchart Symbols', url: 'https://libraries.excalidraw.com/libraries/flowchart.excalidrawlib' },
                                        ].map((lib) => (
                                            <div key={lib.name} className="flex items-center justify-between p-2 bg-background rounded">
                                                <span className="text-sm font-medium">{lib.name}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const currentUrl = new URL(window.location.href);
                                                        currentUrl.hash = `addLibrary=${encodeURIComponent(lib.url)}`;
                                                        window.location.href = currentUrl.toString();
                                                    }}
                                                    className="gap-2"
                                                >
                                                    <Download className="w-3 h-3" />
                                                    Add
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}