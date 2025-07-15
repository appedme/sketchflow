"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Brain, Palette, Target, Lightbulb, Rocket, Search, Star, Clock, GitBranch, Database, Users, BarChart3, Workflow, Zap, Calendar, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectForm } from "@/components/dashboard/ProjectForm";

const templates = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with a clean slate and build from scratch",
    icon: FileText,
    category: "General",
    popular: true,
    trending: false,
    preview: "Perfect for when you have a clear vision and want complete creative freedom",
    tags: ["flexible", "custom", "creative"],
    estimatedTime: "5 min",
  },
  {
    id: "mind-map",
    name: "Mind Map",
    description: "Visual brainstorming and idea organization",
    icon: Brain,
    category: "Creative",
    popular: true,
    trending: true,
    preview: "Organize thoughts, brainstorm ideas, and create visual connections between concepts",
    tags: ["brainstorming", "planning", "visual"],
    estimatedTime: "10 min",
  },
  {
    id: "wireframe",
    name: "UI Wireframe",
    description: "Low-fidelity interface design and prototyping",
    icon: Palette,
    category: "Design",
    popular: true,
    trending: false,
    preview: "Design user interfaces and app layouts with pre-built UI components",
    tags: ["ui", "design", "prototype"],
    estimatedTime: "15 min",
  },
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Create process flows and decision trees",
    icon: GitBranch,
    category: "Process",
    popular: true,
    trending: true,
    preview: "Map out processes, workflows, and decision-making paths",
    tags: ["process", "workflow", "logic"],
    estimatedTime: "12 min",
  },
  {
    id: "system-architecture",
    name: "System Architecture",
    description: "Design technical system architectures",
    icon: Zap,
    category: "Technical",
    popular: true,
    trending: true,
    preview: "Create technical diagrams for software systems and infrastructure",
    tags: ["technical", "architecture", "systems"],
    estimatedTime: "20 min",
  },
  {
    id: "database-schema",
    name: "Database Schema",
    description: "Design database structures and relationships",
    icon: Database,
    category: "Technical",
    popular: false,
    trending: false,
    preview: "Model database tables, relationships, and data structures",
    tags: ["database", "data", "modeling"],
    estimatedTime: "18 min",
  },
  {
    id: "org-chart",
    name: "Organization Chart",
    description: "Visualize team structures and hierarchies",
    icon: Users,
    category: "Business",
    popular: false,
    trending: false,
    preview: "Create organizational charts and team structure diagrams",
    tags: ["organization", "team", "hierarchy"],
    estimatedTime: "8 min",
  },
  {
    id: "workflow",
    name: "Workflow Diagram",
    description: "Map out business processes and workflows",
    icon: Workflow,
    category: "Process",
    popular: false,
    trending: false,
    preview: "Document business processes and operational workflows",
    tags: ["business", "process", "operations"],
    estimatedTime: "15 min",
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Create project timelines and schedules",
    icon: Calendar,
    category: "Planning",
    popular: false,
    trending: false,
    preview: "Plan projects with visual timelines and milestone tracking",
    tags: ["planning", "timeline", "project"],
    estimatedTime: "10 min",
  },
];

const categories = ["All", "General", "Creative", "Design", "Process", "Technical", "Business", "Planning"];

export default function NewProjectPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch = searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const popularTemplates = templates.filter(template => template.popular);
  const trendingTemplates = templates.filter(template => template.trending);
  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Sparkles className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Create New Project</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from our professionally designed templates or start with a blank canvas.
              Get your ideas flowing in minutes, not hours.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selector */}
          <div className="lg:col-span-2">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-semibold text-foreground">Choose Your Starting Point</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">
                      Browse templates designed for different use cases and industries
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Tabs */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search templates..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="browse" className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Browse All
                      </TabsTrigger>
                      <TabsTrigger value="popular" className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        Popular
                      </TabsTrigger>
                      <TabsTrigger value="trending" className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Trending
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="browse" className="mt-6">
                      {/* Category Filter */}
                      <div className="mb-6">
                        <div className="flex gap-2 flex-wrap">
                          {categories.map((category) => (
                            <Button
                              key={category}
                              variant={selectedCategory === category ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(category)}
                              className="transition-all"
                            >
                              {category}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Templates Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border group ${selectedTemplate === template.id ? 'ring-2 ring-primary shadow-lg' : ''
                              }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selectedTemplate === template.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted group-hover:bg-primary/10'
                                  }`}>
                                  <template.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
                                    {template.trending && (
                                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                        <TrendingUp className="w-3 h-3 mr-1" />
                                        Trending
                                      </Badge>
                                    )}
                                    {template.popular && (
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                        <Star className="w-3 h-3 mr-1" />
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.preview}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                      {template.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {template.estimatedTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="popular" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {popularTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border group ${selectedTemplate === template.id ? 'ring-2 ring-primary shadow-lg' : ''
                              }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selectedTemplate === template.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-blue-100 text-blue-600 group-hover:bg-primary/10'
                                  }`}>
                                  <template.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      Popular
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.preview}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                      {template.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {template.estimatedTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="trending" className="mt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {trendingTemplates.map((template) => (
                          <Card
                            key={template.id}
                            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-border group ${selectedTemplate === template.id ? 'ring-2 ring-primary shadow-lg' : ''
                              }`}
                            onClick={() => handleTemplateSelect(template.id)}
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selectedTemplate === template.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-orange-100 text-orange-600 group-hover:bg-primary/10'
                                  }`}>
                                  <template.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold text-foreground truncate">{template.name}</h3>
                                    <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-xs">
                                      <TrendingUp className="w-3 h-3 mr-1" />
                                      Trending
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{template.preview}</p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-1">
                                      {template.tags.slice(0, 2).map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      {template.estimatedTime}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Details Form */}
          <div>
            <Card className="border-border sticky top-8 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Project Details</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configure your new project settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Selected Template Preview */}
                {selectedTemplateData && (
                  <div className="mb-6 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <selectedTemplateData.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{selectedTemplateData.name}</h4>
                        <p className="text-xs text-muted-foreground">{selectedTemplateData.category}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{selectedTemplateData.preview}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {selectedTemplateData.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {selectedTemplateData.estimatedTime}
                      </div>
                    </div>
                  </div>
                )}

                <ProjectForm selectedTemplate={selectedTemplate} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}