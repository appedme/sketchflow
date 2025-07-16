// OpenMoji API service for icon search and management

export interface OpenMojiIcon {
    emoji: string;
    hexcode: string;
    group: string;
    subgroups: string;
    annotation: string;
    tags: string;
    openmoji_tags: string;
    openmoji_author: string;
    openmoji_date: string;
    skintone: string;
    skintone_combination: string;
    skintone_base_emoji: string;
    skintone_base_hexcode: string;
    unicode: number;
    order: number;
}

export class OpenMojiService {
    private static instance: OpenMojiService;
    private icons: OpenMojiIcon[] = [];
    private isLoaded = false;
    private loadingPromise: Promise<void> | null = null;

    static getInstance(): OpenMojiService {
        if (!OpenMojiService.instance) {
            OpenMojiService.instance = new OpenMojiService();
        }
        return OpenMojiService.instance;
    }

    async loadIcons(): Promise<void> {
        if (this.isLoaded) return;
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = this.fetchIcons();
        await this.loadingPromise;
    }

    private async fetchIcons(): Promise<void> {
        try {
            const response = await fetch('https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/data/openmoji.json');
            if (!response.ok) {
                throw new Error(`Failed to fetch OpenMoji data: ${response.status}`);
            }

            const data: OpenMojiIcon[] = await response.json();
            this.icons = data;
            this.isLoaded = true;
            console.log(`Loaded ${this.icons.length} OpenMoji icons`);
        } catch (error) {
            console.error('Error loading OpenMoji icons:', error);
            throw error;
        }
    }

    searchIcons(query: string, limit: number = 50): OpenMojiIcon[] {
        if (!this.isLoaded || !query.trim()) {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const results: OpenMojiIcon[] = [];

        for (const icon of this.icons) {
            if (results.length >= limit) break;

            // Search in annotation (main description)
            if (icon.annotation.toLowerCase().includes(searchTerm)) {
                results.push(icon);
                continue;
            }

            // Search in tags
            if (icon.tags.toLowerCase().includes(searchTerm)) {
                results.push(icon);
                continue;
            }

            // Search in openmoji_tags
            if (icon.openmoji_tags.toLowerCase().includes(searchTerm)) {
                results.push(icon);
                continue;
            }

            // Search in group
            if (icon.group.toLowerCase().includes(searchTerm)) {
                results.push(icon);
                continue;
            }

            // Search in subgroups
            if (icon.subgroups.toLowerCase().includes(searchTerm)) {
                results.push(icon);
                continue;
            }
        }

        return results;
    }

    getIconsByGroup(group: string): OpenMojiIcon[] {
        if (!this.isLoaded) return [];

        return this.icons.filter(icon =>
            icon.group.toLowerCase() === group.toLowerCase()
        );
    }

    getPopularIcons(limit: number = 20): OpenMojiIcon[] {
        if (!this.isLoaded) return [];

        // Return icons with lower order numbers (more popular)
        return this.icons
            .filter(icon => icon.order <= 100) // First 100 are usually most popular
            .slice(0, limit);
    }

    getAllGroups(): string[] {
        if (!this.isLoaded) return [];

        const groups = new Set(this.icons.map(icon => icon.group));
        return Array.from(groups).sort();
    }

    getColorIconUrl(hexcode: string): string {
        return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/color/svg/${hexcode}.svg`;
    }

    getBlackIconUrl(hexcode: string): string {
        return `https://cdn.jsdelivr.net/gh/hfg-gmuend/openmoji@master/black/svg/${hexcode}.svg`;
    }

    getIconUrl(hexcode: string, style: 'color' | 'black' = 'color'): string {
        return style === 'color'
            ? this.getColorIconUrl(hexcode)
            : this.getBlackIconUrl(hexcode);
    }

    // Convert icon to Excalidraw element format
    iconToExcalidrawElement(icon: OpenMojiIcon, x: number, y: number, style: 'color' | 'black' = 'color') {
        const iconUrl = this.getIconUrl(icon.hexcode, style);

        return {
            type: 'image',
            id: `openmoji-${icon.hexcode}-${Date.now()}`,
            x,
            y,
            width: 64,
            height: 64,
            angle: 0,
            strokeColor: 'transparent',
            backgroundColor: 'transparent',
            fillStyle: 'solid',
            strokeWidth: 0,
            strokeStyle: 'solid',
            roughness: 0,
            opacity: 100,
            groupIds: [],
            frameId: null,
            roundness: null,
            seed: Math.floor(Math.random() * 1000000),
            versionNonce: Math.floor(Math.random() * 1000000),
            isDeleted: false,
            boundElements: null,
            updated: 1,
            link: null,
            locked: false,
            fileId: null,
            status: 'pending',
            // Custom properties for OpenMoji
            customData: {
                type: 'openmoji',
                hexcode: icon.hexcode,
                annotation: icon.annotation,
                emoji: icon.emoji,
                style: style,
                url: iconUrl
            }
        };
    }
}