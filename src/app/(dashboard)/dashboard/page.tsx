"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  FileText,
  FolderOpen,
  Clock,
  Users,
  Star,
  TrendingUp,
  Eye,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectFilters } from '@/components/dashboard/ProjectFilters';
import { useApi } from '@/hooks/useApi';

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFavorites, setShowFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/sign-in');
    }
  }, [user, router]);

  // Fetch projects and stats
  const { data: projects = [], isLoading: projectsLoading } = useApi<any[]>(
    '/api/projects'
  );

  const { data: stats = { totalProjects: 0, thisWeek: 0, collaborators: 0, totalViews: 0 } } = useApi<any>(
    '/api/projects/stats'
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src="/logo.svg" alt="SketchFlow" className="w-16 h-16 mx-auto animate-pulse" />
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract all unique tags from projects
  const allTags = Array.from(
    new Set(
      projects
        .filter(p => p.tags && Array.isArray(p.tags))
        .flatMap(p => p.tags as string[])
    )
  );

  const favoriteProjects = projects.filter(p => p.isFavorite);
  const recentProjects = projects.slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-muted-foreground">
                Manage your projects and collaborate with your team
              </p>
            </div>
            <Link href="/dashboard/new-project" >
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                New Project
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{projects.length}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{favoriteProjects.length}</p>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.totalViews}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stats.thisWeek}</p>
                  <p className="text-sm text-muted-foreground">This Week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/new-project" >
            <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">New Project</h3>
                    <p className="text-sm text-muted-foreground">Start from scratch or use a template</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-purple-600 transition-colors">Templates</h3>
                  <p className="text-sm text-muted-foreground">Browse pre-made templates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors">Team</h3>
                  <p className="text-sm text-muted-foreground">Collaborate with others</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-foreground">Your Projects</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage and organize your projects
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="all" className="gap-2">
                    <FolderOpen className="w-4 h-4" />
                    All Projects ({projects.length})
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-2">
                    <Star className="w-4 h-4" />
                    Favorites ({favoriteProjects.length})
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Recent ({recentProjects.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6">
                  <ProjectFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    selectedTags={selectedTags}
                    onTagsChange={setSelectedTags}
                    availableTags={allTags}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    sortOrder={sortOrder}
                    onSortOrderChange={setSortOrder}
                    showFavorites={showFavorites}
                    onShowFavoritesChange={setShowFavorites}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                  />
                  <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                    {projects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4">
                  {favoriteProjects.length > 0 ? (
                    favoriteProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        viewMode="list"
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No favorite projects</h3>
                      <p className="text-muted-foreground">
                        Star your important projects to see them here
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recent" className="space-y-4">
                  {recentProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      viewMode="list"
                    />
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Create your first project to get started with SketchFlow. Choose from templates or start from scratch.
                </p>
                <Link href="/dashboard/new-project" >
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

