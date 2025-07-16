"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { useApi } from '@/hooks/useApi';

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/sign-in');
    }
  }, [user, router]);

  // Fetch projects - only when user is available
  const { data: projects = [], isLoading: projectsLoading, error } = useApi<any[]>(
    user ? '/api/projects' : null
  );

  // Show loading state while user is being determined
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (user === null) {
    return null; // Will redirect in useEffect
  }

  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    project.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'}
            </p>
          </div>
          <Link href="/dashboard/new-project">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Projects */}
        {projectsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-48" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                  <div className="h-8 bg-muted rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Failed to load projects</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="space-y-3">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} viewMode="list" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            {searchQuery ? (
              <>
                <p className="text-muted-foreground mb-4">No projects found for "{searchQuery}"</p>
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No projects yet</p>
                <Link href="/dashboard/new-project">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create your first project
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

