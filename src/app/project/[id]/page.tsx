import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ProjectWorkspace } from '@/components/project/ProjectWorkspace';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;

  // Mock project data - in real app, fetch from database
  const project = {
    id,
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
    category: "Technical",
    visibility: "Team",
    lastModified: "2 minutes ago",
    collaborators: [
      { name: "John Doe", avatar: "JD", color: "#3b82f6" },
      { name: "Jane Smith", avatar: "JS", color: "#ef4444" },
      { name: "Mike Johnson", avatar: "MJ", color: "#10b981" },
    ]
  };

  return (
    <ProjectWorkspace
      projectId={id}
      projectName={project.name}
      isReadOnly={false}
    />
  );
}