"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    ArrowLeft,
    Search,
    Star,
    FileText,
    GitBranch,
    Database,
    Users,
    Brain,
    BarChart3,
    Workflow,
    Zap,
    Calendar,
    Loader2,
    Plus,
    Filter,
    Grid3X3,
    List,
    Clock,
    Eye
} from "lucide-react";
import Link from "next/link";
import { useApi } from '@/hooks/useApi';
import { Loading } from '@/components/loading';

const iconMap = {
    FileText,
    GitBranch,
    Database,
    Users,
    Brain,
    BarChart3,
    Workflow,
    Zap,
    Calendar,
};

const categories = [
    { value: 'All', label: 'All Categories' },
    { value: 'General', label: 'General' },
    { value: 'Process', label: 'Process' },
    { value: 'Technical', label: 'Technical' },
    { value: 'Business', label: 'Business' },
    { value: 'Creative', label: 'Creative' },
    { value: 'Design', label: 'Design' },
    { value: 'Planning', label: 'Planning' },
];

export default function TemplatesPage() {
    const user = useUser();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Redirect if not authenticated
    useEffect(() => {
        if (user === null) {
            router.push('/handler/sign-in?after_auth_return_to=' + encodeURIComponent('/dashboard/templates'));
        }
    }, [user, router]);

    // Fetch templates
    const { data: templates = [], isLoading } = useApi<any[]>(
        '/api/templates'
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loading size="lg" text="Loading templates..." />
            </div>
        );
    }

    // Filter templates
    const filteredTemplates = templates.filter((template: any) => {
        const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
        const matchesSearch = searchQuery === '' ||
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const popularTemplates = templates.filter((template: any) => template.isPopular);

    const handleUseTemplate = (templateId: string) => {
        router.push(`/dashboard/new-project?template=${templateId}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        className="mb-6 hover:bg-muted/50"
                        onClick={() => router.push('/dashboard')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Button>

                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <FileText className="w-8 h-8 text-primary" />
                            <h1 className="text-4xl font-bold text-foreground">Template Library</h1>
                        </div>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Jumpstart your projects with professionally designed templates.
                            Choose from our curated collection to get started quickly.
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search templates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>

                                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                    <SelectTrigger className="w-48">
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
                            </div>

                            <div className="flex items-center gap-1 border rounded-lg p-1">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className="p-2"
                                >
                                    <Grid3X3 className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                                    size="sm"
                                    onClick={() => setViewMode('list')}
                                    className="p-2"
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
                        </div>
                    </CardContent>
                </Card>

                {/* Templates Content */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loading size="md" text="Loading templates..." />
                    </div>
                ) : (
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="all" className="gap-2">
                                <FileText className="w-4 h-4" />
                                All Templates ({filteredTemplates.length})
                            </TabsTrigger>
                            <TabsTrigger value="popular" className="gap-2">
                                <Star className="w-4 h-4" />
                                Popular ({popularTemplates.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            {filteredTemplates.length > 0 ? (
                                <div className={viewMode === 'grid'
                                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                    : 'space-y-4'
                                }>
                                    {filteredTemplates.map((template: any) => (
                                        <TemplateCard
                                            key={template.id}
                                            template={template}
                                            viewMode={viewMode}
                                            onUse={() => handleUseTemplate(template.id)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
                                    <p className="text-muted-foreground">
                                        Try adjusting your search terms or category filter
                                    </p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="popular">
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                : 'space-y-4'
                            }>
                                {popularTemplates.map((template: any) => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        viewMode={viewMode}
                                        onUse={() => handleUseTemplate(template.id)}
                                    />
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}

interface TemplateCardProps {
    template: any;
    viewMode: 'grid' | 'list';
    onUse: () => void;
}

function TemplateCard({ template, viewMode, onUse }: TemplateCardProps) {
    const IconComponent = iconMap[template.icon as keyof typeof iconMap] || FileText;

    if (viewMode === 'grid') {
        return (
            <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        {template.isPopular && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">
                                <Star className="w-3 h-3 mr-1 fill-current" />
                                Popular
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div>
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                {template.name}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {template.description}
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                                {template.category}
                            </Badge>
                            <Button size="sm" onClick={onUse} className="gap-2">
                                <Plus className="w-3 h-3" />
                                Use Template
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // List view
    return (
        <Card className="group hover:shadow-md transition-all duration-200">
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                                    {template.name}
                                </h3>
                                {template.isPopular && (
                                    <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
                                )}
                                <Badge variant="outline" className="text-xs ml-auto">
                                    {template.category}
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                                {template.description}
                            </p>
                        </div>
                    </div>

                    <Button size="sm" onClick={onUse} className="gap-2 ml-4">
                        <Plus className="w-3 h-3" />
                        Use Template
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}