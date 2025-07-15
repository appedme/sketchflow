"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, Brain, Palette, Target, Lightbulb, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/dashboard/ProjectForm";

const templates = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with a clean slate and build from scratch",
    icon: FileText,
    category: "General",
    popular: true,
  },
  {
    id: "mindmap",
    name: "Mind Map",
    description: "Visual brainstorming and idea organization",
    icon: Brain,
    category: "Planning",
    popular: true,
  },
  {
    id: "wireframe",
    name: "UI Wireframe",
    description: "Low-fidelity interface design and prototyping",
    icon: Palette,
    category: "Design",
    popular: true,
  },
  {
    id: "business-plan",
    name: "Business Plan",
    description: "Strategic planning and business documentation",
    icon: Target,
    category: "Business",
    popular: false,
  },
  {
    id: "creative-brief",
    name: "Creative Brief",
    description: "Project planning and creative direction",
    icon: Lightbulb,
    category: "Creative",
    popular: false,
  },
  {
    id: "startup",
    name: "Startup Pitch",
    description: "Investor presentation and startup documentation",
    icon: Rocket,
    category: "Business",
    popular: false,
  },
];

const categories = ["All", "General", "Planning", "Design", "Business", "Creative"];

export default function NewProjectPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const filteredTemplates = selectedCategory === "All"
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  const popularTemplates = templates.filter(template => template.popular);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Create New Project</h1>
            <p className="text-muted-foreground mt-2">
              Start your next visual masterpiece with our powerful tools
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Selector */}
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Choose a Template</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Select from our curated templates or start from scratch
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category Filter */}
                <div className="mb-6">
                  <div className="flex gap-2 flex-wrap">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Popular Templates */}
                {selectedCategory === "All" && (
                  <div className="mb-8">
                    <h3 className="text-md font-medium text-foreground mb-4">Popular Templates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {popularTemplates.map((template) => (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-all hover:shadow-md border-border ${
                            selectedTemplate === template.id ? 'ring-2 ring-ring' : ''
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <template.icon className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-medium text-foreground">{template.name}</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">{template.description}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* All Templates */}
                <div>
                  <h3 className="text-md font-medium text-foreground mb-4">
                    {selectedCategory === "All" ? "All Templates" : `${selectedCategory} Templates`}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-md border-border ${
                          selectedTemplate === template.id ? 'ring-2 ring-ring' : ''
                        }`}
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              <template.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">{template.name}</h3>
                                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                  {template.category}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Project Details Form */}
          <div>
            <Card className="border-border sticky top-8">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Project Details</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Basic information about your project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectForm selectedTemplate={selectedTemplate} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}