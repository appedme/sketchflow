import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { ProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { getProject } from '@/lib/actions/projects';

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

  // Fetch real project data from database
  const project = await getProject(id, userId);
  
  if (!project) {
    notFound();
  }

  return (
    <ProjectWorkspace
      projectId={id}
      projectName={project.name}
      isReadOnly={false}
    />
  );
}