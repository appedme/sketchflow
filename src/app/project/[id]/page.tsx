import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Share, 
  Download, 
  Undo, 
  Redo, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Image, 
  Layers,
  Settings,
  Users,
  MessageSquare,
  History,
  ArrowLeft,
  Play
} from "lucide-react";
import Link from "next/link";

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Mock project data - in real app, fetch from database
  const project = {
    id: params.id,
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
    category: "Technical",
    visibility: "Team",
    lastModified: "2 minutes ago",
    collaborators: [
      { name: "John Doe", avatar: "JD" },
      { name: "Jane Smith", avatar: "JS" },
    ]
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Top Toolbar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-heading font-semibold text-lg">{project.name}</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">{project.category}</Badge>
                <span>•</span>
                <span>Last saved {project.lastModified}</span>
              </div>
            </div>
          </div>

          {/* Center Section - Main Tools */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Undo className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Redo className="w-4 h-4" />
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant="ghost" size="sm">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">100%</span>
            <Button variant="ghost" size="sm">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Collaborators */}
            <div className="flex items-center gap-2">
              {project.collaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium"
                >
                  {collaborator.avatar}
                </div>
              ))}
              <Button variant="ghost" size="sm">
                <Users className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button variant="ghost" size="sm">
              <MessageSquare className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <History className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Share className="w-4 h-4" />
              Share
            </Button>
            <Button size="sm" className="gap-2">
              <Save className="w-4 h-4" />
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Tools */}
        <div className="w-16 border-r bg-muted/30 flex flex-col items-center py-4 gap-2">
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Move className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Square className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Circle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <ArrowRight className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Type className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Image className="w-5 h-5" />
          </Button>
          <Separator className="w-8 my-2" />
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Layers className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-gray-50 dark:bg-gray-900">
          {/* Canvas */}
          <div className="absolute inset-0 overflow-auto">
            <div className="min-w-full min-h-full relative">
              {/* Grid Background */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '20px 20px'
                }}
              />
              
              {/* Canvas Content */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <Card className="w-96 h-64 border-2 border-dashed border-muted-foreground/30 bg-background/50">
                  <CardContent className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-heading font-semibold mb-2">Start Creating</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select a tool from the sidebar to begin designing your diagram
                      </p>
                      <Button size="sm">
                        Add First Element
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l bg-background overflow-y-auto">
          <div className="p-4">
            <h3 className="font-heading font-semibold mb-4">Properties</h3>
            
            {/* Element Properties */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Element Properties</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block text-muted-foreground mb-1">Fill Color</label>
                    <div className="flex gap-2">
                      <div className="w-8 h-8 bg-blue-500 rounded border cursor-pointer"></div>
                      <div className="w-8 h-8 bg-green-500 rounded border cursor-pointer"></div>
                      <div className="w-8 h-8 bg-red-500 rounded border cursor-pointer"></div>
                      <div className="w-8 h-8 bg-yellow-500 rounded border cursor-pointer"></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Border Width</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="10" 
                      defaultValue="2" 
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Opacity</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      defaultValue="100" 
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Layers Panel */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Layers</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <span>Background</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-primary/10 rounded">
                    <span>Main Content</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Info */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-3">Project Info</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <span className="ml-2">2 days ago</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Modified:</span>
                    <span className="ml-2">{project.lastModified}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Visibility:</span>
                    <span className="ml-2">{project.visibility}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Elements:</span>
                    <span className="ml-2">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}