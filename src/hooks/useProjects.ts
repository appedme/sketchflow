import { useApi, useMutation } from '@/hooks/useApi';
import { mutate } from 'swr';

export interface Project {
    id: string;
    name: string;
    description: string | null;
    category: string;
    visibility: string;
    ownerId: string;
    viewCount: number | null;
    isFavorite: boolean | null;
    tags: string[] | null;
    status: string | null;
    lastActivityAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProjectData {
    name?: string;
    description?: string;
    category?: string;
    visibility?: string;
    tags?: string[];
    isFavorite?: boolean;
    status?: string;
}

// Hook for fetching projects
export function useProjects(filters?: {
    category?: string;
    visibility?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}) {
    const queryParams = new URLSearchParams();
    
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.visibility) queryParams.append('visibility', filters.visibility);
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
    
    const url = `/api/projects${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return useApi<Project[]>(url, {
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        dedupingInterval: 30000, // Cache for 30 seconds
    });
}

// Hook for fetching a single project
export function useProject(projectId: string | null) {
    return useApi<Project>(
        projectId ? `/api/projects/${projectId}` : null,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            dedupingInterval: 60000, // Cache for 1 minute
        }
    );
}

// Hook for updating a project
export function useUpdateProject() {
    return useMutation<Project>(
        async ({ projectId, data }: { projectId: string; data: UpdateProjectData }) => {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = (errorData as any)?.message || 'Failed to update project';
                throw new Error(message);
            }
            
            return response.json();
        },
        {
            onSuccess: (updatedProject) => {
                // Update the projects list cache
                mutate('/api/projects');
                
                // Update the specific project cache
                mutate(`/api/projects/${updatedProject.id}`, updatedProject, false);
                
                // Update any filtered project lists that might contain this project
                mutate(
                    (key) => typeof key === 'string' && key.startsWith('/api/projects?'),
                    undefined,
                    { revalidate: true }
                );
            },
            onError: (error) => {
                console.error('Failed to update project:', error);
            }
        }
    );
}

// Hook for deleting a project
export function useDeleteProject() {
    return useMutation<{ success: boolean; projectId: string }>(
        async (projectId: string) => {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = (errorData as any)?.message || 'Failed to delete project';
                throw new Error(message);
            }
            
            const result = await response.json();
            return { success: true, projectId };
        },
        {
            onSuccess: (data) => {
                // Remove from projects list cache
                mutate('/api/projects');
                
                // Remove the specific project cache
                mutate(`/api/projects/${data.projectId}`, undefined, false);
                
                // Update any filtered project lists
                mutate(
                    (key) => typeof key === 'string' && key.startsWith('/api/projects?'),
                    undefined,
                    { revalidate: true }
                );
            },
            onError: (error) => {
                console.error('Failed to delete project:', error);
            }
        }
    );
}

// Hook for duplicating a project
export function useDuplicateProject() {
    return useMutation<Project>(
        async (projectId: string) => {
            const response = await fetch(`/api/projects/${projectId}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = (errorData as any)?.message || 'Failed to duplicate project';
                throw new Error(message);
            }
            
            return response.json();
        },
        {
            onSuccess: () => {
                // Revalidate projects list to show the new duplicate
                mutate('/api/projects');
                
                // Update any filtered project lists
                mutate(
                    (key) => typeof key === 'string' && key.startsWith('/api/projects?'),
                    undefined,
                    { revalidate: true }
                );
            },
            onError: (error) => {
                console.error('Failed to duplicate project:', error);
            }
        }
    );
}

// Hook for toggling project favorite status
export function useToggleFavorite() {
    return useMutation<Project>(
        async ({ projectId, isFavorite }: { projectId: string; isFavorite: boolean }) => {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isFavorite }),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const message = (errorData as any)?.message || 'Failed to update favorite status';
                throw new Error(message);
            }
            
            return response.json();
        },
        {
            onSuccess: (updatedProject) => {
                // Update caches
                mutate('/api/projects');
                mutate(`/api/projects/${updatedProject.id}`, updatedProject, false);
                mutate(
                    (key) => typeof key === 'string' && key.startsWith('/api/projects?'),
                    undefined,
                    { revalidate: true }
                );
            },
            onError: (error) => {
                console.error('Failed to toggle favorite:', error);
            }
        }
    );
}
