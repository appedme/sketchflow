import { redirect } from 'next/navigation';

interface CanvasRedirectProps {
  params: Promise<{
    id: string;
    canvasId: string;
  }>;
}

export default async function CanvasRedirect({ params }: CanvasRedirectProps) {
  const { id: projectId, canvasId } = await params;

  // Redirect to new workspace route
  redirect(`/workspace/${projectId}/${canvasId}`);
}