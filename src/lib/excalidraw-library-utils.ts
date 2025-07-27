// Excalidraw Library Utilities
import {
    loadLibraryFromBlob,
    loadSceneOrLibraryFromBlob,
    serializeLibraryAsJSON,
    mergeLibraryItems,
    parseLibraryTokensFromUrl,
    MIME_TYPES
} from '@excalidraw/excalidraw';

import type {
    LibraryItems,
    LibraryItem,
    ExcalidrawImperativeAPI
} from '@excalidraw/excalidraw/types';

export interface LibraryMetadata {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    itemCount: number;
}

export interface SavedLibrary extends LibraryMetadata {
    items: LibraryItems;
}

// Popular Excalidraw libraries
export const POPULAR_LIBRARIES = [
    {
        name: 'Excalidraw Official',
        description: 'Official Excalidraw library with common shapes and icons',
        url: 'https://libraries.excalidraw.com/libraries/excalidraw-official.excalidrawlib',
        tags: ['official', 'shapes', 'icons']
    },
    {
        name: 'UI Components',
        description: 'User interface components for wireframing and mockups',
        url: 'https://libraries.excalidraw.com/libraries/ui-components.excalidrawlib',
        tags: ['ui', 'wireframe', 'components']
    },
    {
        name: 'Flowchart Symbols',
        description: 'Standard flowchart and diagram symbols',
        url: 'https://libraries.excalidraw.com/libraries/flowchart.excalidrawlib',
        tags: ['flowchart', 'diagram', 'symbols']
    },
    {
        name: 'AWS Architecture',
        description: 'AWS cloud architecture icons and components',
        url: 'https://libraries.excalidraw.com/libraries/aws-architecture.excalidrawlib',
        tags: ['aws', 'cloud', 'architecture']
    },
    {
        name: 'System Design',
        description: 'System design and architecture components',
        url: 'https://libraries.excalidraw.com/libraries/system-design.excalidrawlib',
        tags: ['system', 'design', 'architecture']
    }
];

// Library storage keys
const STORAGE_KEYS = {
    SAVED_LIBRARIES: 'excalidraw-saved-libraries',
    CURRENT_LIBRARY: 'excalidraw-current-library',
    LIBRARY_METADATA: 'excalidraw-library-metadata'
};

/**
 * Load library from a file blob
 */
export async function loadLibraryFromFile(file: File): Promise<LibraryItems> {
    try {
        const contents = await loadSceneOrLibraryFromBlob(file, null, null);

        if (contents.type === MIME_TYPES.excalidrawlib) {
            const libraryData = contents.data as any;
            return libraryData.libraryItems || [];
        } else {
            throw new Error('Invalid library file format');
        }
    } catch (error) {
        console.error('Error loading library from file:', error);
        throw error;
    }
}

/**
 * Load library from URL
 */
export async function loadLibraryFromURL(url: string): Promise<LibraryItems> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch library: ${response.statusText}`);
        }

        const blob = await response.blob();
        return await loadLibraryFromFile(new File([blob], 'library.excalidrawlib'));
    } catch (error) {
        console.error('Error loading library from URL:', error);
        throw error;
    }
}

/**
 * Export library to JSON string
 */
export function exportLibraryAsJSON(library: LibraryItems): string {
    return serializeLibraryAsJSON(library);
}

/**
 * Download library as file
 */
export function downloadLibrary(library: LibraryItems, filename?: string): void {
    const libraryJSON = exportLibraryAsJSON(library);
    const blob = new Blob([libraryJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `excalidraw-library-${new Date().toISOString().split('T')[0]}.excalidrawlib`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Merge multiple libraries
 */
export function mergeLibraries(libraries: LibraryItems[]): LibraryItems {
    return libraries.reduce((merged, library) => {
        return mergeLibraryItems(merged, library);
    }, []);
}

/**
 * Save library to local storage
 */
export function saveLibraryLocally(library: SavedLibrary): void {
    try {
        const savedLibraries = getSavedLibraries();
        const existingIndex = savedLibraries.findIndex(lib => lib.id === library.id);

        if (existingIndex >= 0) {
            savedLibraries[existingIndex] = library;
        } else {
            savedLibraries.push(library);
        }

        localStorage.setItem(STORAGE_KEYS.SAVED_LIBRARIES, JSON.stringify(savedLibraries));
    } catch (error) {
        console.error('Error saving library locally:', error);
        throw error;
    }
}

/**
 * Get saved libraries from local storage
 */
export function getSavedLibraries(): SavedLibrary[] {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.SAVED_LIBRARIES);
        return saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Error loading saved libraries:', error);
        return [];
    }
}

/**
 * Delete saved library
 */
export function deleteSavedLibrary(libraryId: string): void {
    try {
        const savedLibraries = getSavedLibraries();
        const filtered = savedLibraries.filter(lib => lib.id !== libraryId);
        localStorage.setItem(STORAGE_KEYS.SAVED_LIBRARIES, JSON.stringify(filtered));
    } catch (error) {
        console.error('Error deleting saved library:', error);
        throw error;
    }
}

/**
 * Create library metadata
 */
export function createLibraryMetadata(
    name: string,
    description: string,
    items: LibraryItems,
    author?: string
): LibraryMetadata {
    return {
        id: Date.now().toString(),
        name,
        description,
        version: '1.0.0',
        author: author || 'Unknown',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        itemCount: items.length
    };
}

/**
 * Add library items to Excalidraw canvas
 */
export function addLibraryItemsToCanvas(
    excalidrawAPI: ExcalidrawImperativeAPI,
    items: LibraryItems,
    position?: { x: number; y: number }
): void {
    try {
        if (items.length === 0) return;

        // Add items to canvas at specified position or random position
        const baseX = position?.x || Math.random() * 200 + 100;
        const baseY = position?.y || Math.random() * 200 + 100;

        items.forEach((item, index) => {
            const offsetX = (index % 3) * 150; // Arrange in grid
            const offsetY = Math.floor(index / 3) * 150;

            excalidrawAPI.addElementsFromLibrary([item], {
                x: baseX + offsetX,
                y: baseY + offsetY
            });
        });
    } catch (error) {
        console.error('Error adding library items to canvas:', error);
        throw error;
    }
}

/**
 * Get current library from Excalidraw
 */
export function getCurrentLibrary(excalidrawAPI: ExcalidrawImperativeAPI): LibraryItems {
    try {
        return excalidrawAPI.getLibrary() || [];
    } catch (error) {
        console.error('Error getting current library:', error);
        return [];
    }
}

/**
 * Update Excalidraw library
 */
export function updateExcalidrawLibrary(
    excalidrawAPI: ExcalidrawImperativeAPI,
    library: LibraryItems
): void {
    try {
        excalidrawAPI.updateLibrary(library);
    } catch (error) {
        console.error('Error updating Excalidraw library:', error);
        throw error;
    }
}

/**
 * Clear Excalidraw library
 */
export function clearExcalidrawLibrary(excalidrawAPI: ExcalidrawImperativeAPI): void {
    try {
        excalidrawAPI.updateLibrary([]);
    } catch (error) {
        console.error('Error clearing Excalidraw library:', error);
        throw error;
    }
}

/**
 * Search libraries by name or tags
 */
export function searchLibraries(libraries: SavedLibrary[], query: string): SavedLibrary[] {
    if (!query.trim()) return libraries;

    const searchTerm = query.toLowerCase();
    return libraries.filter(library =>
        library.name.toLowerCase().includes(searchTerm) ||
        library.description.toLowerCase().includes(searchTerm) ||
        library.author.toLowerCase().includes(searchTerm) ||
        library.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
}

/**
 * Parse library tokens from URL hash
 */
export function parseLibraryFromURL(): { libraryUrl: string; idToken: string | null } | null {
    return parseLibraryTokensFromUrl();
}

/**
 * Generate library preview (simplified representation)
 */
export function generateLibraryPreview(library: LibraryItems): string {
    // This would generate a preview image or representation
    // For now, return a placeholder
    return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23f0f0f0"/><text x="32" y="32" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12">${library.length}</text></svg>`;
}

/**
 * Validate library format
 */
export function validateLibraryFormat(data: any): boolean {
    try {
        return Array.isArray(data) || (data && Array.isArray(data.libraryItems));
    } catch {
        return false;
    }
}

/**
 * Get library statistics
 */
export function getLibraryStats(library: LibraryItems): {
    totalItems: number;
    elementTypes: Record<string, number>;
    averageSize: { width: number; height: number };
} {
    const stats = {
        totalItems: library.length,
        elementTypes: {} as Record<string, number>,
        averageSize: { width: 0, height: 0 }
    };

    if (library.length === 0) return stats;

    let totalWidth = 0;
    let totalHeight = 0;

    library.forEach(item => {
        // Count element types (this would need to be adapted based on actual library item structure)
        const type = 'unknown'; // item.type || 'unknown';
        stats.elementTypes[type] = (stats.elementTypes[type] || 0) + 1;

        // Calculate average size (placeholder logic)
        totalWidth += 100; // item.width || 100;
        totalHeight += 100; // item.height || 100;
    });

    stats.averageSize.width = totalWidth / library.length;
    stats.averageSize.height = totalHeight / library.length;

    return stats;
}