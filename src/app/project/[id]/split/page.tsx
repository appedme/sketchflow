import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SplitViewWorkspace } from '@/components/project/SplitViewWorkspace';

interface SplitViewPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    left?: string;
    leftType?: 'document' | 'canvas';
    right?: string;
    rightType?: 'document' | 'canvas';
  }>;
}

export default async function SplitViewPage({ params, searchParams }: SplitViewPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id: projectId } = await params;
  const { left, leftType, right, rightType } = await searchParams;

  // Mock project data - in real app, fetch from database
  const project = {
    id: projectId,
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
  };

  return (
    <SplitViewWorkspace
      projectId={projectId}
      projectName={project.name}
      leftItemId={left}
      leftItemType={leftType || 'document'}
      rightItemId={right}
      rightItemType={rightType || 'canvas'}
    />
  );
}