import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Grid, List, Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProjectDashboard() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('');
    const [visibility, setVisibility] = useState<string>('');
    const [sortBy, setSortBy] = useState<string>('updatedAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Use SWR hook to fetch projects with filters
    const { data: projects, error, isLoading, mutate } = useProjects({
        category: category || undefined,
        visibility: visibility || undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
    });

    const handleRefresh = () => {
        mutate();
    };

    const handleClearFilters = () => {
        setSearch('');
        setCategory('');
        setVisibility('');
        setSortBy('updatedAt');
        setSortOrder('desc');
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <p className="text-destructive mb-4">Failed to load projects</p>
                    <Button onClick={handleRefresh} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Projects</h1>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                    >
                        <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                    >
                        <List className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
                <div className="flex-1 min-w-64">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                
                <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={visibility} onValueChange={setVisibility}>
                    <SelectTrigger className="w-32">
                        <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="updatedAt">Last Updated</SelectItem>
                        <SelectItem value="createdAt">Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="viewCount">Views</SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={handleClearFilters}>
                    <Filter className="w-4 h-4 mr-2" />
                    Clear
                </Button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            )}

            {/* Projects Grid/List */}
            {projects && projects.length > 0 ? (
                <div className={cn(
                    "gap-6",
                    viewMode === 'grid' 
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                        : "flex flex-col"
                )}>
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            viewMode={viewMode}
                            onUpdate={handleRefresh}
                        />
                    ))}
                </div>
            ) : (
                !isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <p className="text-muted-foreground mb-4">
                                {search || category || visibility 
                                    ? 'No projects match your filters' 
                                    : 'No projects found'
                                }
                            </p>
                            {(search || category || visibility) && (
                                <Button onClick={handleClearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            )}
                        </div>
                    </div>
                )
            )}

            {/* Project Count */}
            {projects && projects.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                    Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                </div>
            )}
        </div>
    );
}
