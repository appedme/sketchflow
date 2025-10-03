import useSWR from 'swr';
import { useUser } from '@stackframe/stack';

interface ProjectData {
    id: string;
    name: string;
    description?: string;
    visibility: 'public' | 'private';
    ownerId: string;
    userRole?: string;
    createdAt: string;
    updatedAt: string;
}

interface DocumentData {
    id: string;
    title: string;
    content: any;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

interface CanvasData {
    id: string;
    title: string;
    elements: any[];
    appState: any;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

const fetcher = async <T>(url: string): Promise<T> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json() as T;
};

export function useProjectData(projectId: string | null) {
    const user = useUser();

    return useSWR<ProjectData>(
        projectId ? `/api/projects/${projectId}` : null,
        (url: string) => fetcher<ProjectData>(url),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 30000, // 30 seconds
            errorRetryCount: 3,
            errorRetryInterval: 1000,
        }
    );
}

export function useProjectFiles(projectId: string | null) {
    const user = useUser();

    const { data: documents = [], error: docsError, mutate: mutateDocuments } = useSWR<DocumentData[]>(
        projectId ? `/api/projects/${projectId}/documents` : null,
        (url: string) => fetcher<DocumentData[]>(url),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // 10 seconds
        }
    );

    const { data: canvases = [], error: canvasError, mutate: mutateCanvases } = useSWR<CanvasData[]>(
        projectId ? `/api/projects/${projectId}/canvases` : null,
        (url: string) => fetcher<CanvasData[]>(url),
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // 10 seconds
        }
    );

    const allFiles = [
        ...documents.map((doc) => ({ ...doc, type: 'document' as const })),
        ...canvases.map((canvas) => ({ ...canvas, type: 'canvas' as const }))
    ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return {
        files: allFiles,
        documents,
        canvases,
        isLoading: !docsError && !canvasError && (!documents || !canvases),
        error: docsError || canvasError,
        mutateDocuments,
        mutateCanvases,
        mutateAll: () => {
            mutateDocuments();
            mutateCanvases();
        }
    };
}