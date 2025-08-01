"use client";

import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@stackframe/stack';
import { useRouter, useSearchParams } from 'next/navigation';
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

import { ThemeToggleSimple } from "@/components/theme-toggle-simple";

import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { ProjectFilters } from '@/components/dashboard/ProjectFilters';
import { useApi } from '@/hooks/useApi';
import { useCachedApi } from '@/hooks/useCachedApi';
import { cn } from '@/lib/utils';
import { Loading } from '@/components/loading';

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
  const searchParams = useSearchParams();

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
      router.push('/handler/sign-in?after_auth_return_to=' + encodeURIComponent('/dashboard'));
    }
  }, [user, router]);

  // Handle redirect parameter after sign-in
  useEffect(() => {
    const redirect = searchParams.get('redirect');
    if (redirect && user) {
      // Redirect to the intended destination
      router.replace(redirect);
    }
  }, [searchParams, router, user]);

  // Fetch projects with caching
  const { data: projects = [], isLoading: projectsLoading, error, mutate: refreshProjects } = useCachedApi<Project[]>(
    user ? '/api/projects' : null
  );

  // Show loading state while user is being determined
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading size="md" text="Loading dashboard..." />
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  // Generate project names using unique name generator (client-side version)
  const generateProjectName = () => {
    // Using the same dictionaries as the server-side version
    const adjectives = ['Brave', 'Clever', 'Bright', 'Swift', 'Bold', 'Gentle', 'Wise', 'Kind', 'Strong', 'Quick', 'Happy', 'Calm', 'Fresh', 'Smart', 'Cool'];
    const colors = ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Brown', 'Black', 'White', 'Gray', 'Silver', 'Gold', 'Copper', 'Bronze'];
    const animals = ['Tiger', 'Lion', 'Eagle', 'Wolf', 'Bear', 'Fox', 'Deer', 'Rabbit', 'Elephant', 'Dolphin', 'Whale', 'Shark', 'Hawk', 'Owl', 'Panda'];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];

    return `${adjective} ${color} ${animal}`;
  };

  // Handle instant project creation
  const handleCreateProject = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generateProjectName(),
          description: 'A new project ready for your ideas',
          category: 'general',
          visibility: 'private',
          tags: []
        }),
      });

      if (!response.ok) throw new Error('Failed to create project');

      const newProject = await response.json() as { id: string };
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
    <div className="min-h-screen  ">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className='hidden sm:block'>
              <h1 className="text-3xl font-bold text-foreground">
                Welcome back, {user?.displayName?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your projects and bring your ideas to life
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                className="gap-2"
                onClick={handleCreateProject}
                disabled={isLoading}
              >
                <Plus className="w-4 h-4" />
                {isLoading ? 'Creating...' : 'New Project'}
              </Button>
              <ThemeToggleSimple />
              <UserButton />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Folder className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.favorites}</p>
                    <p className="text-sm text-muted-foreground">Favorites</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.recent}</p>
                    <p className="text-sm text-muted-foreground">Recent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stats.shared}</p>
                    <p className="text-sm text-muted-foreground">Shared</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6 bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Quick Filters */}
              <Tabs value={filterBy} onValueChange={(value) => setFilterBy(value as FilterBy)} className="w-auto">
                <TabsList className="bg-muted">
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
              <div className="flex bg-muted rounded-lg p-1">
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
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Filter by tags:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-accent"
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
                      className="h-6 px-2 text-muted-foreground hover:text-foreground"
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
              <Card key={i} className="animate-pulse bg-card/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="flex gap-2">
                      <div className="h-6 bg-muted rounded w-16" />
                      <div className="h-6 bg-muted rounded w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-card/80 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Failed to load projects</p>
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
          <Card className="bg-card">
            <CardContent className="p-12 text-center">
              {searchQuery || selectedTags.length > 0 || selectedCategory !== 'all' ? (
                <>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No projects found</h3>
                  <p className="text-muted-foreground mb-4">
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
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Ready to create something amazing?</h3>
                  <p className="text-muted-foreground mb-6">
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