"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import useSWR from 'swr';
import { useUser } from '@clerk/nextjs';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  visibility: string;
  templateId?: string;
  ownerId: string;
  thumbnailUrl?: string;
  settings?: any;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  projectId: string;
  title: string;
  content?: any;
  contentText?: string;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Canvas {
  id: string;
  projectId: string;
  title: string;
  elements?: any[];
  appState?: any;
  files?: any;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectContextType {
  project: Project | null;
  documents: Document[];
  canvases: Canvas[];
  isLoading: boolean;
  error: any;
  mutateProject: () => void;
  mutateDocuments: () => void;
  mutateCanvases: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch');
  }
  return res.json();
};

interface ProjectProviderProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectProvider({ children, projectId }: ProjectProviderProps) {
  const { user } = useUser();
  
  const { data: project, error: projectError, mutate: mutateProject } = useSWR(
    user?.id && projectId ? `/api/projects/${projectId}` : null,
    fetcher
  );

  const { data: documents = [], error: documentsError, mutate: mutateDocuments } = useSWR(
    user?.id && projectId ? `/api/projects/${projectId}/documents` : null,
    fetcher
  );

  const { data: canvases = [], error: canvasesError, mutate: mutateCanvases } = useSWR(
    user?.id && projectId ? `/api/projects/${projectId}/canvases` : null,
    fetcher
  );

  const isLoading = !project && !projectError;
  const error = projectError || documentsError || canvasesError;

  return (
    <ProjectContext.Provider
      value={{
        project: (project as any) || null,
        documents: (documents as any) || [],
        canvases: (canvases as any) || [],
        isLoading,
        error,
        mutateProject,
        mutateDocuments,
        mutateCanvases,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}