import { stackServerApp } from '@/lib/stack';
import { redirect, notFound } from 'next/navigation';
import { FullScreenCanvasEditor } from '@/components/project/FullScreenCanvasEditor';
import { getProject } from '@/lib/actions/projects';

interface CanvasPageProps {
  params: Promise<{
    id: string;
    canvasId: string;
  }>;
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const user = await stackServerApp.getUser();
  const { id: projectId, canvasId } = await params;

  // Fetch real project data from database
  const project = await getProject(projectId, user?.id);

  if (!project) {
    notFound();
  }

  // Check if user is signed in
  if (!user) {
    // If project is public, allow viewing without authentication
    if (project.visibility === 'public') {
      return (
        <FullScreenCanvasEditor
          projectId={projectId}
          canvasId={canvasId}
          projectName={project.name}
          isReadOnly={true}
        />
      );
    } else {
      // If project is private, redirect to sign in with return URL
      redirect(`/sign-in?redirect=${encodeURIComponent(`/project/${projectId}/canvas/${canvasId}`)}`);
    }
  }

  // Determine if user has edit access
  const isOwner = project.ownerId === user.id;
  const userRole = project.userRole || 'viewer';
  const hasEditAccess = isOwner || ['owner', 'editor'].includes(userRole);

  return (
    <FullScreenCanvasEditor
      projectId={projectId}
      canvasId={canvasId}
      projectName={project.name}
      isReadOnly={!hasEditAccess}
    />
  );
}