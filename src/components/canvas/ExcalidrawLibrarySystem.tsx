"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Loader2, Download } from 'lucide-react';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

interface Library {
  name: string;
  description: string;
  tags: string[];
  published: string;
  version: number;
  source: string;
  preview?: string;
}

interface ExcalidrawLibrarySystemProps {
  excalidrawAPI: ExcalidrawImperativeAPI | null;
  isOpen: boolean;
  onClose: () => void;
}

const LIBRARIES_API = 'https://libraries.excalidraw.com/libraries.json';
const ITEMS_PER_PAGE = 20;

export function ExcalidrawLibrarySystem({ 
  excalidrawAPI, 
  isOpen, 
  onClose 
}: ExcalidrawLibrarySystemProps) {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [filteredLibraries, setFilteredLibraries] = useState<Library[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedItems, setDisplayedItems] = useState(ITEMS_PER_PAGE);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch libraries from Excalidraw API
  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(LIBRARIES_API);
        if (!response.ok) {
          throw new Error('Failed to fetch libraries');
        }
        
        const data = await response.json();
        const librariesData = data.libraries || [];
        
        setLibraries(librariesData);
        setFilteredLibraries(librariesData);
      } catch (err) {
        console.error('Error fetching libraries:', err);
        setError(err instanceof Error ? err.message : 'Failed to load libraries');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchLibraries();
    }
  }, [isOpen]);

  // Filter libraries based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLibraries(libraries);
      setDisplayedItems(ITEMS_PER_PAGE);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = libraries.filter((library) => {
      const matchesName = library.name.toLowerCase().includes(query);
      const matchesDescription = library.description?.toLowerCase().includes(query);
      const matchesTags = library.tags?.some(tag => tag.toLowerCase().includes(query));
      
      return matchesName || matchesDescription || matchesTags;
    });

    setFilteredLibraries(filtered);
    setDisplayedItems(ITEMS_PER_PAGE);
  }, [searchQuery, libraries]);

  // Handle infinite scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
    
    if (scrollPercentage > 0.8 && displayedItems < filteredLibraries.length) {
      setDisplayedItems(prev => Math.min(prev + ITEMS_PER_PAGE, filteredLibraries.length));
    }
  }, [displayedItems, filteredLibraries.length]);

  // Load library into canvas
  const loadLibrary = async (library: Library) => {
    if (!excalidrawAPI) {
      console.error('Excalidraw API not available');
      return;
    }

    try {
      const response = await fetch(library.source);
      if (!response.ok) {
        throw new Error('Failed to load library content');
      }

      const libraryData = await response.json();
      
      // Add library items to Excalidraw
      if (libraryData.library || libraryData.libraryItems) {
        const items = libraryData.library || libraryData.libraryItems;
        
        // Import library items
        const currentLibraryItems = await excalidrawAPI.getLibraryItems();
        const updatedLibraryItems = [...currentLibraryItems, ...items];
        
        await excalidrawAPI.updateLibrary({
          libraryItems: updatedLibraryItems,
          merge: true
        });

        console.log(`Successfully loaded library: ${library.name}`);
      }
    } catch (err) {
      console.error('Error loading library:', err);
      setError(err instanceof Error ? err.message : 'Failed to load library');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background border-l border-border shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Excalidraw Libraries</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search libraries by name or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Libraries List */}
      <ScrollArea 
        className="flex-1" 
        ref={scrollAreaRef}
        onScroll={handleScroll}
      >
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">Error loading libraries</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          ) : filteredLibraries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium">No libraries found</p>
              <p className="text-sm mt-1">
                {searchQuery ? 'Try a different search term' : 'No libraries available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredLibraries.slice(0, displayedItems).map((library, index) => (
                <div
                  key={`${library.name}-${index}`}
                  className="border border-border rounded-lg p-4 hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => loadLibrary(library)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {library.name}
                      </h3>
                      {library.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {library.description}
                        </p>
                      )}
                      {library.tags && library.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {library.tags.slice(0, 3).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {library.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{library.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Loading More Indicator */}
          {displayedItems < filteredLibraries.length && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Showing {displayedItems} of {filteredLibraries.length} libraries
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border text-xs text-muted-foreground text-center">
        <p>
          Libraries from{' '}
          <a
            href="https://libraries.excalidraw.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Excalidraw Community
          </a>
        </p>
      </div>
    </div>
  );
}
