"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Search,
    Filter,
    SortAsc,
    SortDesc,
    Star,
    Tag,
    Calendar,
    Eye,
    Grid3X3,
    List,
    X
} from "lucide-react";

interface ProjectFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    availableTags: string[];
    sortBy: string;
    onSortChange: (sort: string) => void;
    sortOrder: 'asc' | 'desc';
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    showFavorites: boolean;
    onShowFavoritesChange: (show: boolean) => void;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
}

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'technical', label: 'Technical' },
    { value: 'business', label: 'Business' },
    { value: 'creative', label: 'Creative' },
    { value: 'design', label: 'Design' },
    { value: 'planning', label: 'Planning' },
];

const sortOptions = [
    { value: 'updated', label: 'Last Updated' },
    { value: 'created', label: 'Date Created' },
    { value: 'name', label: 'Name' },
    { value: 'views', label: 'Views' },
];

export function ProjectFilters({
    searchQuery,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    selectedTags,
    onTagsChange,
    availableTags,
    sortBy,
    onSortChange,
    sortOrder,
    onSortOrderChange,
    showFavorites,
    onShowFavoritesChange,
    viewMode,
    onViewModeChange,
}: ProjectFiltersProps) {
    const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

    const handleTagToggle = (tag: string) => {
        if (selectedTags.includes(tag)) {
            onTagsChange(selectedTags.filter(t => t !== tag));
        } else {
            onTagsChange([...selectedTags, tag]);
        }
    };

    const handleRemoveTag = (tag: string) => {
        onTagsChange(selectedTags.filter(t => t !== tag));
    };

    const clearAllFilters = () => {
        onSearchChange('');
        onCategoryChange('all');
        onTagsChange([]);
        onShowFavoritesChange(false);
    };

    const hasActiveFilters = searchQuery || selectedCategory !== 'all' || selectedTags.length > 0 || showFavorites;

    return (
        <div className="space-y-4">
            {/* Search and Quick Actions */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Favorites Toggle */}
                    <Button
                        variant={showFavorites ? "default" : "outline"}
                        size="sm"
                        onClick={() => onShowFavoritesChange(!showFavorites)}
                        className="gap-2"
                    >
                        <Star className={`w-4 h-4 ${showFavorites ? 'fill-current' : ''}`} />
                        <span className="hidden sm:inline">Favorites</span>
                    </Button>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 border rounded-lg p-1">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('list')}
                        className="p-2"
                    >
                        <List className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => onViewModeChange('grid')}
                        className="p-2"
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger className="w-40">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                                {category.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Tags Filter */}
                {availableTags.length > 0 && (
                    <DropdownMenu open={isTagDropdownOpen} onOpenChange={setIsTagDropdownOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Tag className="w-4 h-4" />
                                Tags
                                {selectedTags.length > 0 && (
                                    <Badge variant="secondary" className="ml-1 text-xs">
                                        {selectedTags.length}
                                    </Badge>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <div className="p-2">
                                <div className="text-sm font-medium mb-2">Filter by tags</div>
                                <div className="space-y-1">
                                    {availableTags.map((tag) => (
                                        <div
                                            key={tag}
                                            className="flex items-center gap-2 p-1 hover:bg-accent rounded cursor-pointer"
                                            onClick={() => handleTagToggle(tag)}
                                        >
                                            <div className={`w-3 h-3 border rounded ${selectedTags.includes(tag) ? 'bg-primary border-primary' : 'border-muted-foreground'}`} />
                                            <span className="text-sm">{tag}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                {/* Sort */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2">
                            {sortOrder === 'asc' ? (
                                <SortAsc className="w-4 h-4" />
                            ) : (
                                <SortDesc className="w-4 h-4" />
                            )}
                            Sort
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <div className="p-2">
                            <div className="text-sm font-medium mb-2">Sort by</div>
                            {sortOptions.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => onSortChange(option.value)}
                                    className={sortBy === option.value ? 'bg-accent' : ''}
                                >
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onSortOrderChange('asc')}>
                                <SortAsc className="w-4 h-4 mr-2" />
                                Ascending
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onSortOrderChange('desc')}>
                                <SortDesc className="w-4 h-4 mr-2" />
                                Descending
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-2 text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Active Filters */}
            {(selectedTags.length > 0 || selectedCategory !== 'all' || showFavorites) && (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">Active filters:</span>

                    {selectedCategory !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {categories.find(c => c.value === selectedCategory)?.label}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => onCategoryChange('all')}
                            />
                        </Badge>
                    )}

                    {showFavorites && (
                        <Badge variant="secondary" className="gap-1">
                            <Star className="w-3 h-3 fill-current" />
                            Favorites
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => onShowFavoritesChange(false)}
                            />
                        </Badge>
                    )}

                    {selectedTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                            <X
                                className="w-3 h-3 cursor-pointer"
                                onClick={() => handleRemoveTag(tag)}
                            />
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}