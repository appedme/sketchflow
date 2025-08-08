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

const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
};

export function useProjectData(projectId: string | null) {
    const user = useUser();

    return useSWR<ProjectData>(
        projectId ? `/api/projects/${projectId}` : null,
        fetcher,
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

    const { data: documents = [], error: docsError, mutate: mutateDocuments } = useSWR(
        projectId ? `/api/projects/${projectId}/documents` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // 10 seconds
        }
    );

    const { data: canvases = [], error: canvasError, mutate: mutateCanvases } = useSWR(
        projectId ? `/api/projects/${projectId}/canvases` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // 10 seconds
        }
    );

    const allFiles = [
        ...documents.map((doc: any) => ({ ...doc, type: 'document' as const })),
        ...canvases.map((canvas: any) => ({ ...canvas, type: 'canvas' as const }))
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