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
}

const LIBRARIES_API = 'https://libraries.excalidraw.com/libraries.json';
const ITEMS_PER_PAGE = 20;

export function ExcalidrawLibrarySystem({ 
  excalidrawAPI,
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
        
        const data: any = await response.json();
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

    fetchLibraries();
  }, []);

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

      const libraryData: any = await response.json();
      
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

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <h3 className="text-sm font-semibold">Community Libraries</h3>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search libraries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchQuery('')}
              className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6"
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
        <div className="p-3 space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive">
              <p className="font-medium text-sm">Error loading libraries</p>
              <p className="text-xs text-muted-foreground mt-1">{error}</p>
            </div>
          ) : filteredLibraries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="font-medium text-sm">No libraries found</p>
              <p className="text-xs mt-1">
                {searchQuery ? 'Try a different search term' : 'No libraries available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredLibraries.slice(0, displayedItems).map((library, index) => (
                <div
                  key={`${library.name}-${index}`}
                  className="border border-border rounded-md p-3 hover:bg-accent transition-colors cursor-pointer group"
                  onClick={() => loadLibrary(library)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs truncate group-hover:text-primary transition-colors">
                        {library.name}
                      </h4>
                      {library.description && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                          {library.description}
                        </p>
                      )}
                      {library.tags && library.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {library.tags.slice(0, 2).map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="inline-flex items-center px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                          {library.tags.length > 2 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{library.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <Download className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Loading More Indicator */}
          {displayedItems < filteredLibraries.length && (
            <div className="text-center py-3 text-xs text-muted-foreground">
              Showing {displayedItems} of {filteredLibraries.length}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-2 border-t border-border text-[10px] text-muted-foreground text-center">
        <p>
          From{' '}
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
