import { stackServerApp } from '@/lib/stack';
import { redirect, notFound } from 'next/navigation';
import { ProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { getProject } from '@/lib/actions/projects';

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { id } = await params;

  // Fetch real project data from database
  const project = await getProject(id, user.id);

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