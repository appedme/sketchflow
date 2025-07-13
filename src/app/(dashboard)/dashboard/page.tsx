import { currentUser } from '@clerk/nextjs/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  FolderOpen, 
  Clock, 
  Users,
  Search,
  MoreHorizontal
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Mock data for recent projects
const recentProjects = [
  {
    id: "1",
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
    category: "Technical",
    lastModified: "2 hours ago",
    collaborators: ["JD", "JS"],
  },
  {
    id: "2", 
    name: "User Journey Map",
    description: "Customer experience mapping for mobile app",
    category: "UX Design",
    lastModified: "1 day ago",
    collaborators: ["MJ"],
  },
  {
    id: "3",
    name: "Database Schema",
    description: "Complete database structure and relationships",
    category: "Technical", 
    lastModified: "3 days ago",
    collaborators: ["SW", "TB", "LD"],
  }
];

export default async function DashboardPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'there'}
          </h1>
          <p className="text-gray-600">
            Manage your projects and collaborate with your team
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/dashboard/new-project">
            <Card className="cursor-pointer hover:shadow-sm transition-shadow border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">New Project</h3>
                    <p className="text-sm text-gray-500">Start from scratch or use a template</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="cursor-pointer hover:shadow-sm transition-shadow border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Templates</h3>
                  <p className="text-sm text-gray-500">Browse pre-made templates</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-sm transition-shadow border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Team</h3>
                  <p className="text-sm text-gray-500">Collaborate with others</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium text-gray-900">Recent Projects</CardTitle>
                <CardDescription className="text-gray-500">
                  Your recently accessed projects
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search projects..." className="pl-10 w-64 border-gray-200" />
                </div>
                <Link href="/dashboard/new-project">
                  <Button className="bg-gray-900 hover:bg-gray-800">
                    <Plus className="w-4 h-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <Link key={project.id} href={`/project/${project.id}`}>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{project.name}</h3>
                          <p className="text-sm text-gray-500">{project.description}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {project.category}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {project.lastModified}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-1">
                          {project.collaborators.map((collaborator, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 bg-gray-300 rounded-full border border-white flex items-center justify-center text-xs font-medium text-gray-600"
                            >
                              {collaborator}
                            </div>
                          ))}
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">
                  Create your first project to get started
                </p>
                <Link href="/dashboard/new-project">
                  <Button className="bg-gray-900 hover:bg-gray-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}