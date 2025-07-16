export interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id: number;
    avg_color: string;
    src: {
        original: string;
        large2x: string;
        large: string;
        medium: string;
        small: string;
        portrait: string;
        landscape: string;
        tiny: string;
    };
    liked: boolean;
    alt: string;
}

export interface PexelsSearchResponse {
    total_results: number;
    page: number;
    per_page: number;
    photos: PexelsPhoto[];
    next_page?: string;
}

export class PexelsService {
    private static instance: PexelsService;
    private readonly apiKey = '563492ad6f917000010000015e64d156cc71428b9584ede1c5ca7fc7';
    private readonly baseUrl = 'https://api.pexels.com/v1';

    private constructor() { }

    static getInstance(): PexelsService {
        if (!PexelsService.instance) {
            PexelsService.instance = new PexelsService();
        }
        return PexelsService.instance;
    }

    async searchPhotos(query: string, page: number = 1, perPage: number = 20): Promise<PexelsSearchResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
                {
                    headers: {
                        'Authorization': this.apiKey,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error searching Pexels photos:', error);
            throw error;
        }
    }

    async getCuratedPhotos(page: number = 1, perPage: number = 20): Promise<PexelsSearchResponse> {
        try {
            const response = await fetch(
                `${this.baseUrl}/curated?page=${page}&per_page=${perPage}`,
                {
                    headers: {
                        'Authorization': this.apiKey,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching curated photos:', error);
            throw error;
        }
    }
}