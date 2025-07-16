import { stackServerApp } from '@/lib/stack';
import { redirect } from 'next/navigation';
import { FullScreenCanvasEditor } from '@/components/project/FullScreenCanvasEditor';

interface CanvasPageProps {
  params: Promise<{
    id: string;
    canvasId: string;
  }>;
}

export default async function CanvasPage({ params }: CanvasPageProps) {
  const user = await stackServerApp.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const { id: projectId, canvasId } = await params;

  // Mock project data - in real app, fetch from database
  const project = {
    id: projectId,
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
  };

  return (
    <FullScreenCanvasEditor
      projectId={projectId}
      canvasId={canvasId}
      projectName={project.name}
    />
  );
}