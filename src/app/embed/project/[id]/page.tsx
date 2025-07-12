import { ProjectWorkspace } from '@/components/project/ProjectWorkspace';

interface EmbedProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EmbedProjectPage({ params }: EmbedProjectPageProps) {
  const { id } = await params;

  // Mock project data - in real app, fetch from database
  const project = {
    id,
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
    category: "Technical",
    visibility: "Team",
    lastModified: "2 minutes ago",
  };

  return (
    <div className="h-screen w-full">
      <ProjectWorkspace
        projectId={id}
        projectName={project.name}
        isReadOnly={true}
      />
    </div>
  );
}