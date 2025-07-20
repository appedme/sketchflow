import { useState } from 'react';
import { ProjectCard } from './ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, FolderOpen } from 'lucide-react';
import { ModeToggler, ViewMode } from './ModeToggler';
import { cn } from '@/lib/utils';

export function ProjectDashboard() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
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
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-6 rounded-lg border border-border shadow-sm">
                    <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                        <ModeToggler 
                            viewMode={viewMode} 
                            onViewModeChange={setViewMode}
                        />
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-card rounded-lg border border-border p-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
                        <div className="flex-1 min-w-64 sm:min-w-80 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                                placeholder="Search projects..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="w-full sm:w-40">
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
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue placeholder="Visibility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                                <SelectItem value="public">Public</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-full sm:w-36">
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
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center h-32">
                        <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
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
                            <div className="text-center space-y-4">
                                <FolderOpen className="w-16 h-16 text-muted-foreground opacity-50 mx-auto" />
                                <div>
                                    <h3 className="text-lg font-semibold text-foreground mb-2">
                                        {search || category || visibility 
                                            ? 'No projects match your filters' 
                                            : 'No projects found'
                                        }
                                    </h3>
                                    <p className="text-muted-foreground mb-4">
                                        {search || category || visibility 
                                            ? 'Try adjusting your search criteria' 
                                            : 'Create your first project to get started'
                                        }
                                    </p>
                                    {(search || category || visibility) && (
                                        <Button onClick={handleClearFilters} variant="outline">
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                )}

                {/* Project Count */}
                {projects && projects.length > 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                        Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                    </div>
                )}
            </div>
        </div>
    );
}
