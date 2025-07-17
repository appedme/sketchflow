// Excalidraw Libraries Integration
export interface ExcalidrawLibrary {
    id: string;
    name: string;
    description: string;
    authors: Array<{
        name: string;
        url?: string;
    }>;
    source: string;
    preview: string;
    created: string;
    updated: string;
    version: number;
}

export interface LibraryItem {
    id: string;
    status: string;
    elements: any[];
    created: number;
}

const LIBRARIES_API_URL = 'https://libraries.excalidraw.com/libraries.json';
const LIBRARY_BASE_URL = 'https://libraries.excalidraw.com';

// Cache for libraries
let librariesCache: ExcalidrawLibrary[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchExcalidrawLibraries(): Promise<ExcalidrawLibrary[]> {
    // Return cached data if still valid
    if (librariesCache && Date.now() - cacheTimestamp < CACHE_DURATION) {
        return librariesCache;
    }

    try {
        const response = await fetch(LIBRARIES_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const libraries: ExcalidrawLibrary[] = await response.json();

        // Cache the results
        librariesCache = libraries;
        cacheTimestamp = Date.now();

        return libraries;
    } catch (error) {
        console.error('Error fetching Excalidraw libraries:', error);

        // Return cached data if available, even if expired
        if (librariesCache) {
            return librariesCache;
        }

        // Return default libraries if no cache available
        return getDefaultLibraries();
    }
}

export async function fetchLibraryItems(library: ExcalidrawLibrary): Promise<LibraryItem[]> {
    try {
        const libraryUrl = `${LIBRARY_BASE_URL}/${library.source}`;
        const response = await fetch(libraryUrl);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json() as any;
        return data.library || [];
    } catch (error) {
        console.error(`Error fetching library items for ${library.name}:`, error);
        return [];
    }
}

export function getLibraryPreviewUrl(library: ExcalidrawLibrary): string {
    return `${LIBRARY_BASE_URL}/${library.preview}`;
}

export function getDefaultLibraries(): ExcalidrawLibrary[] {
    return [
        {
            id: "software-architecture",
            name: "Software Architecture",
            description: "Collection of software architecture diagrams and components for system design.",
            authors: [{ name: "youritjang" }],
            source: "libraries/youritjang/software-architecture.excalidrawlib",
            preview: "libraries/youritjang/software-architecture.png",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1
        },
        {
            id: "aws-architecture-icons",
            name: "AWS Architecture Icons",
            description: "Complete collection of AWS architecture icons for cloud infrastructure diagrams.",
            authors: [{ name: "childishgirl" }],
            source: "libraries/childishgirl/aws-architecture-icons.excalidrawlib",
            preview: "libraries/childishgirl/aws-architecture-icons.png",
            created: "2024-01-01",
            updated: "2024-01-01",
            version: 1
        },
        {
            id: "3MQwFMPiYkC",
            name: "Polygons",
            description: "Collection of regular polygons: triangle, pentagon, hexagon, octagon, decagon & dodecagon.",
            authors: [{ name: "Lipis", url: "https://twitter.com/lipis" }],
            source: "lipis/polygons.excalidrawlib",
            preview: "lipis/polygons.png",
            created: "2020-12-02",
            updated: "2020-12-02",
            version: 1
        },
        {
            id: "A0qy8Favqlu",
            name: "Stars",
            description: "Collection of regular stars.",
            authors: [{ name: "Lipis", url: "https://twitter.com/lipis" }],
            source: "lipis/stars.excalidrawlib",
            preview: "lipis/stars.png",
            created: "2020-12-02",
            updated: "2020-12-02",
            version: 1
        },
        {
            id: "8mFhaPGiMd6",
            name: "Gadgets",
            description: "Collection of technical gadgets: Smartphone, MP3-Player, Smartwatch, Tablet, Laptop.",
            authors: [{ name: "MorgeMoensch", url: "https://morgemoensch.dev/" }],
            source: "morgemoensch/gadgets.excalidrawlib",
            preview: "morgemoensch/gadgets.png",
            created: "2020-12-15",
            updated: "2020-12-15",
            version: 1
        },
        {
            id: "jXpa3f12fQ",
            name: "Robots",
            description: "Collection of robots in different moods.",
            authors: [{ name: "Kaligule", url: "https://schauderbasis.de" }],
            source: "kaligule/robots.excalidrawlib",
            preview: "kaligule/robots.png",
            created: "2021-03-23",
            updated: "2021-03-23",
            version: 1
        },
        {
            id: "9Ui0oAbe0x3",
            name: "Snowflake Icons",
            description: "Collection of Snowflake datawarehouse icons.",
            authors: [{ name: "Thijs de Vries", url: "https://binx.io/blog/team/thijs-de-vries/" }],
            source: "thijsdev/snowflake.excalidrawlib",
            preview: "thijsdev/snowflake.png",
            created: "2021-06-10",
            updated: "2021-06-10",
            version: 1
        }
    ];
}

export function searchLibraries(libraries: ExcalidrawLibrary[], query: string): ExcalidrawLibrary[] {
    if (!query.trim()) return libraries;

    const searchTerm = query.toLowerCase();
    return libraries.filter(library =>
        library.name.toLowerCase().includes(searchTerm) ||
        library.description.toLowerCase().includes(searchTerm) ||
        library.authors.some(author => author.name.toLowerCase().includes(searchTerm))
    );
}

export function getPopularLibraries(libraries: ExcalidrawLibrary[]): ExcalidrawLibrary[] {
    // Return top 5 libraries (could be based on usage stats in the future)
    return libraries.slice(0, 5);
}