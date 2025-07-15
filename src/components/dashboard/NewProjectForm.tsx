"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, GitBranch, Database, Users, BarChart3, Workflow, Zap, Brain, Calendar } from "lucide-react";

const projectTemplates = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with a completely blank canvas",
    icon: FileText,
    category: "General",
    popular: true,
  },
  {
    id: "flowchart",
    name: "Flowchart",
    description: "Create process flows and decision trees",
    icon: GitBranch,
    category: "Process",
    popular: true,
  },
  {
    id: "database-schema",
    name: "Database Schema",
    description: "Design database structures and relationships",
    icon: Database,
    category: "Technical",
    popular: false,
  },
  {
    id: "org-chart",
    name: "Organization Chart",
    description: "Visualize team structures and hierarchies",
    icon: Users,
    category: "Business",
    popular: false,
  },
  {
    id: "mind-map",
    name: "Mind Map",
    description: "Brainstorm ideas and concepts visually",
    icon: Brain,
    category: "Creative",
    popular: true,
  },
  {
    id: "wireframe",
    name: "Wireframe",
    description: "Design user interfaces and layouts",
    icon: BarChart3,
    category: "Design",
    popular: false,
  },
  {
    id: "workflow",
    name: "Workflow Diagram",
    description: "Map out business processes and workflows",
    icon: Workflow,
    category: "Process",
    popular: false,
  },
  {
    id: "system-architecture",
    name: "System Architecture",
    description: "Design technical system architectures",
    icon: Zap,
    category: "Technical",
    popular: true,
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Create project timelines and schedules",
    icon: Calendar,
    category: "Planning",
    popular: false,
  },
];

const categories = ["All", "General", "Process", "Technical", "Business", "Creative", "Design", "Planning"];

interface NewProjectFormProps {
  onSubmit: (formData: FormData) => void;
}

export function NewProjectForm({ onSubmit }: NewProjectFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('template', selectedTemplate);
    onSubmit(formData);
  };

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const filteredTemplates = selectedCategory === "All"
    ? projectTemplates
    : projectTemplates.filter(template => template.category === selectedCategory);

  const popularTemplates = projectTemplates.filter(template => template.popular);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

      {/* Project Details Form */}
      <div className="lg:col-span-1">
        <Card className="border-gray-200 sticky top-8">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-gray-900">Project Details</CardTitle>
            <CardDescription className="text-gray-500">
              Basic information about your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter project name"
                    required
                    className="mt-1 border-gray-200"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Brief description of your project"
                    rows={3}
                    className="mt-1 border-gray-200"
                  />
                </div>

                <div>
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                  <Select name="category">
                    <SelectTrigger className="mt-1 border-gray-200">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visibility" className="text-sm font-medium text-gray-700">Visibility</Label>
                  <Select name="visibility" defaultValue="private">
                    <SelectTrigger className="mt-1 border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-gray-600">
                  Selected template: <span className="font-medium">{projectTemplates.find(t => t.id === selectedTemplate)?.name}</span>
                </div>

                <Button type="submit" className="w-full  mt-6">
                  Create Project
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Templates Section */}
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Choose a Template</h2>
          <p className="text-gray-600 mb-4">Select a template to get started quickly</p>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={selectedCategory === category
                  ? ""
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }
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
            <h3 className="text-md font-medium text-gray-900 mb-4">Popular Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {popularTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer hover:shadow-sm transition-shadow border-gray-200 ${selectedTemplate === template.id ? 'ring-2 ring-gray-900' : ''
                    }`}
                  onClick={() => handleTemplateClick(template.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <template.icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">{template.name}</h3>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">{template.description}</p>
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
          <h3 className="text-md font-medium text-gray-900 mb-4">
            {selectedCategory === "All" ? "All Templates" : `${selectedCategory} Templates`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer hover:shadow-sm transition-shadow border-gray-200 ${selectedTemplate === template.id ? 'ring-2 ring-gray-900' : ''
                  }`}
                onClick={() => handleTemplateClick(template.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <template.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}