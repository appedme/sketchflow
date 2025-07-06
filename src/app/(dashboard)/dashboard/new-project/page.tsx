import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, GitBranch, Database, Users, BarChart3, Workflow, Zap, Brain, Calendar } from "lucide-react";
import Link from "next/link";
import { createProject } from "./actions";

const projectTemplates = [
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with a completely blank canvas",
    icon: FileText,
    category: "General",
    popular: false,
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

export default async function NewProjectPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-heading font-bold">Create New Project</h1>
              <p className="text-muted-foreground">
                Choose a template to get started or create from scratch
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Details Form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                  <CardDescription>
                    Set up your project information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <form action={createProject} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input 
                        id="projectName" 
                        name="projectName"
                        placeholder="My Awesome Project"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projectDescription">Description (Optional)</Label>
                      <Textarea 
                        id="projectDescription" 
                        name="projectDescription"
                        placeholder="Describe what this project is about..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projectCategory">Category</Label>
                      <Select name="projectCategory">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                          <SelectItem value="process">Process</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                          <SelectItem value="planning">Planning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="projectVisibility">Visibility</Label>
                      <Select defaultValue="private">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private (Only you)</SelectItem>
                          <SelectItem value="team">Team (Your team members)</SelectItem>
                          <SelectItem value="public">Public (Anyone with link)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button type="submit" className="w-full" size="lg">
                      Create Project
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Template Selection */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-heading font-semibold mb-2">Choose a Template</h2>
                <p className="text-muted-foreground">
                  Select a template to start with pre-built elements and layouts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projectTemplates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card 
                      key={template.id} 
                      className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                {template.name}
                                {template.popular && (
                                  <Badge variant="secondary" className="text-xs">
                                    Popular
                                  </Badge>
                                )}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs mt-1">
                                {template.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-sm">
                          {template.description}
                        </CardDescription>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full mt-3"
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Quick Start Tips */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Start Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">🎨 Design Tips</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Start with a clear purpose in mind</li>
                        <li>• Use consistent colors and shapes</li>
                        <li>• Keep it simple and focused</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">🚀 Pro Tips</h4>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Use templates to save time</li>
                        <li>• Collaborate with team members</li>
                        <li>• Export in multiple formats</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}