import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { FullScreenDocumentEditor } from '@/components/project/FullScreenDocumentEditor';

interface DocumentPageProps {
  params: Promise<{
    id: string;
    documentId: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id: projectId, documentId } = await params;

  // Mock project data - in real app, fetch from database
  const project = {
    id: projectId,
    name: "System Architecture Diagram",
    description: "Main system architecture for the new platform",
  };

  return (
    <FullScreenDocumentEditor
      projectId={projectId}
      documentId={documentId}
      projectName={project.name}
    />
  );
}