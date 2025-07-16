"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Loader2,
  Filter,
  Grid3X3,
  List,
  Star,
  Clock,
  Tag,
  Folder,
  TrendingUp,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Calendar,
  Eye,
  Users,
  Sparkles
} from "lucide-react";

import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectFilters } from '@/components/dashboard/ProjectFilters';
import { useApi } from '@/hooks/useApi';
import { cn } from '@/lib/utils';

interface Project {
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

type ViewMode = 'grid' | 'list';
type SortBy = 'updated' | 'created' | 'name' | 'views';
type FilterBy = 'all' | 'favorites' | 'recent' | 'shared';

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push('/sign-in');
    }
  }, [user, router]);

  // Fetch projects
  const { data: projects = [], isLoading: projectsLoading, error, mutate: refreshProjects } = useApi<Project[]>(
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

  if (user === null) {
    return null;
  }

  // Generate random project names
  const generateRandomName = () => {
    const adjectives = ['Creative', 'Innovative', 'Dynamic', 'Modern', 'Smart', 'Bold', 'Fresh', 'Bright', 'Quick', 'Cool'];
    const nouns = ['Project', 'Canvas', 'Workspace', 'Studio', 'Lab', 'Hub', 'Space', 'Board', 'Flow', 'Sketch'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000) + 1;
    return `${adjective} ${noun} ${number}`;
  };

  // Handle instant project creation
  const handleCreateProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generateRandomName(),
          description: 'A new project ready for your ideas',
          category: 'general',
          visibility: 'private',
          tags: []
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const newProject = await response.json();
      refreshProjects();
      router.push(`/project/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      setIsLoading(false);
    }
  };

  // Get all unique tags from projects
  const allTags = Array.from(
    new Set(
      projects
        .flatMap(project => project.tags || [])
        .filter(Boolean)
    )
  );

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Search filter
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (selectedCategory !== 'all' && project.category !== selectedCategory) {
        return false;
      }
      
      // Tag filter
      if (selectedTags.length > 0) {
        const projectTags = project.tags || [];
        if (!selectedTags.some(tag => projectTags.includes(tag))) {
          return false;
        }
      }
      
      // Status filter
      switch (filterBy) {
        case 'favorites':
          return project.isFavorite;
        case 'recent':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return new Date(project.updatedAt) > weekAgo;
        case 'shared':
          return project.visibility !== 'private';
        default:
          return true;
      }
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'views':
          comparison = (a.viewCount || 0) - (b.viewCount || 0);
          break;
        case 'updated':
        default:
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  // Get project stats
  const stats = {
    total: projects.length,
    favorites: projects.filter(p => p.isFavorite).length,
    recent: projects.filter(p => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(p.updatedAt) > weekAgo;
    }).length,
    shared: projects.filter(p => p.visibility !== 'private').length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-slate-600 mt-1">
                Manage your projects and bring your ideas to life
              </p>
            </div>
            <Button
              className="gap-2"
              onClick={handleCreateProject}
              disabled={isLoading}
            >
              <Plus className="w-4 h-4" />
              {isLoading ? 'Creating...' : 'New Project'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Folder className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                    <p className="text-sm text-slate-600">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Star className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.favorites}</p>
                    <p className="text-sm text-slate-600">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.recent}</p>
                    <p className="text-sm text-slate-600">Recent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Users className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.shared}</p>
                    <p className="text-sm text-slate-600">Shared</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6 bg-white border-slate-200">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <Tabs value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)} className="w-auto">
                <TabsList className="bg-slate-100">
                  <TabsTrigger value="all" className="gap-2">
                    <Folder className="w-4 h-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="favorites" className="gap-2">
                    <Star className="w-4 h-4" />
                    Favorites
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="shared" className="gap-2">
                    <Users className="w-4 h-4" />
                    Shared
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    {sortOrder === 'desc' ? <SortDesc className="w-4 h-4" /> : <SortAsc className="w-4 h-4" />}
                    Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('updated')}>
                    <Clock className="w-4 h-4 mr-2" />
                    Last Updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('created')}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Date Created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    <Tag className="w-4 h-4 mr-2" />
                    Name
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('views')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Views
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'desc' ? <SortAsc className="w-4 h-4 mr-2" /> : <SortDesc className="w-4 h-4 mr-2" />}
                    {sortOrder === 'desc' ? 'Ascending' : 'Descending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Mode */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="gap-2"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-slate-100"
                      onClick={() => {
                        setSelectedTags(prev =>
                          prev.includes(tag)
                            ? prev.filter(t => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="h-6 px-2 text-slate-500 hover:text-slate-700"
                    >
                      Clear all
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects */}
        {projectsLoading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-white/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-slate-200 rounded w-16" />
                      <div className="h-6 bg-slate-200 rounded w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <p className="text-slate-600 mb-4">Failed to load projects</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : filteredProjects.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                viewMode={viewMode}
                onUpdate={refreshProjects}
              />
            ))}
          </div>
        ) : (
          <Card className="bg-white">
            <CardContent className="p-12 text-center">
              {searchQuery || selectedTags.length > 0 || selectedCategory !== 'all' ? (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
                  <p className="text-slate-600 mb-4">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedTags([]);
                      setSelectedCategory('all');
                      setFilterBy('all');
                    }}
                  >
                    Clear all filters
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Ready to create something amazing?</h3>
                  <p className="text-slate-600 mb-6">
                    Start your first project and bring your ideas to life with our powerful tools.
                  </p>
                  <Button
                    className="gap-2"
                    onClick={handleCreateProject}
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    {isLoading ? 'Creating...' : 'Create your first project'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}