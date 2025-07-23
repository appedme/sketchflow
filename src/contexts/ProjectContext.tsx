"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';

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
  reloadProject: () => Promise<void>;
  reloadDocuments: () => Promise<void>;
  reloadCanvases: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

interface ProjectProviderProps {
  children: ReactNode;
  projectId: string;
}

export function ProjectProvider({ children, projectId }: ProjectProviderProps) {
  const user = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Load project data directly without caching
  const loadProjectData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error('Failed to load project');
      }

      const projectData = await response.json();
      setProject(projectData);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, projectId]);

  // Load documents data directly without caching
  const loadDocumentsData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const documentsData = await response.json();
      setDocuments(documentsData);
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError(err);
    }
  }, [user?.id, projectId]);

  // Load canvases data directly without caching
  const loadCanvasesData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/projects/${projectId}/canvases`);
      if (!response.ok) {
        throw new Error('Failed to load canvases');
      }

      const canvasesData = await response.json();
      setCanvases(canvasesData);
    } catch (err) {
      console.error('Failed to load canvases:', err);
      setError(err);
    }
  }, [user?.id, projectId]);

  // Load all data on mount and when dependencies change
  useEffect(() => {
    loadProjectData();
    loadDocumentsData();
    loadCanvasesData();
  }, [loadProjectData, loadDocumentsData, loadCanvasesData]);

  return (
    <ProjectContext.Provider
      value={{
        project: project || null,
        documents: documents || [],
        canvases: canvases || [],
        isLoading,
        error,
        reloadProject: loadProjectData,
        reloadDocuments: loadDocumentsData,
        reloadCanvases: loadCanvasesData,
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