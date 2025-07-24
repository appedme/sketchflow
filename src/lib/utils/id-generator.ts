import { uniqueNamesGenerator, Config, adjectives, colors, animals, names, starWars } from 'unique-names-generator';
import { getDb } from '@/lib/db';
import { projects, documents, canvases } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Configuration for different types of IDs
const projectConfig: Config = {
    dictionaries: [adjectives, colors, animals],
    separator: '-',
    length: 3,
    style: 'lowerCase',
};

const documentConfig: Config = {
    dictionaries: [adjectives, names],
    separator: '-',
    length: 2,
    style: 'lowerCase',
};

const canvasConfig: Config = {
    dictionaries: [colors, starWars],
    separator: '-',
    length: 2,
    style: 'lowerCase',
};

/**
 * Generate a unique project ID with database uniqueness check
 */
export async function generateUniqueProjectId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;
    const db = getDb();

    while (attempts < maxAttempts) {
        const id = uniqueNamesGenerator(projectConfig);

        try {
            // Check if ID already exists in database
            const existing = await db
                .select({ id: projects.id })
                .from(projects)
                .where(eq(projects.id, id))
                .limit(1);

            if (existing.length === 0) {
                return id;
            }
        } catch (error) {
            console.error('Error checking project ID uniqueness:', error);
            // If database check fails, add random suffix and return
            return `${id}-${Math.random().toString(36).substring(2, 8)}`;
        }

        attempts++;
    }

    // Fallback: add timestamp if all attempts failed
    const fallbackId = uniqueNamesGenerator(projectConfig);
    return `${fallbackId}-${Date.now().toString(36)}`;
}

/**
 * Generate a unique document ID with database uniqueness check
 */
export async function generateUniqueDocumentId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const id = uniqueNamesGenerator(documentConfig);

        try {
            // Check if ID already exists in database
            const existing = await db
                .select({ id: documents.id })
                .from(documents)
                .where(eq(documents.id, id))
                .limit(1);

            if (existing.length === 0) {
                return id;
            }
        } catch (error) {
            console.error('Error checking document ID uniqueness:', error);
            // If database check fails, add random suffix and return
            return `${id}-${Math.random().toString(36).substring(2, 8)}`;
        }

        attempts++;
    }

    // Fallback: add timestamp if all attempts failed
    const fallbackId = uniqueNamesGenerator(documentConfig);
    return `${fallbackId}-${Date.now().toString(36)}`;
}

/**
 * Generate a unique canvas ID with database uniqueness check
 */
export async function generateUniqueCanvasId(): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
        const id = uniqueNamesGenerator(canvasConfig);

        try {
            // Check if ID already exists in database
            const existing = await db
                .select({ id: canvases.id })
                .from(canvases)
                .where(eq(canvases.id, id))
                .limit(1);

            if (existing.length === 0) {
                return id;
            }
        } catch (error) {
            console.error('Error checking canvas ID uniqueness:', error);
            // If database check fails, add random suffix and return
            return `${id}-${Math.random().toString(36).substring(2, 8)}`;
        }

        attempts++;
    }

    // Fallback: add timestamp if all attempts failed
    const fallbackId = uniqueNamesGenerator(canvasConfig);
    return `${fallbackId}-${Date.now().toString(36)}`;
}

/**
 * Generate a simple unique ID without database check (for non-persistent items)
 */
export function generateSimpleId(type: 'project' | 'document' | 'canvas' = 'project'): string {
    const configs = {
        project: projectConfig,
        document: documentConfig,
        canvas: canvasConfig,
    };

    return uniqueNamesGenerator(configs[type]);
}

/**
 * Generate a batch of unique IDs for bulk operations
 */
export async function generateUniqueIds(
    type: 'project' | 'document' | 'canvas',
    count: number
): Promise<string[]> {
    const ids: string[] = [];

    for (let i = 0; i < count; i++) {
        let id: string;

        switch (type) {
            case 'project':
                id = await generateUniqueProjectId();
                break;
            case 'document':
                id = await generateUniqueDocumentId();
                break;
            case 'canvas':
                id = await generateUniqueCanvasId();
                break;
            default:
                id = generateSimpleId(type);
        }

        ids.push(id);
    }

    return ids;
}