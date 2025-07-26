import { stackServerApp } from '@/lib/stack';
import { redirect, notFound } from 'next/navigation';
import { FullScreenDocumentEditor } from '@/components/project/FullScreenDocumentEditor';
import { getProject } from '@/lib/actions/projects';

interface DocumentPageProps {
  params: Promise<{
    id: string;
    documentId: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const user = await stackServerApp.getUser();
  const { id: projectId, documentId } = await params;

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
        <FullScreenDocumentEditor
          projectId={projectId}
          documentId={documentId}
          projectName={project.name}
          isReadOnly={true}
        />
      );
    } else {
      // If project is private, redirect to sign in with return URL
      redirect(`/sign-in?redirect=${encodeURIComponent(`/project/${projectId}/document/${documentId}`)}`);
    }
  }

  // Determine if user has edit access
  const isOwner = project.ownerId === user.id;
  const userRole = project.userRole || 'viewer';
  const hasEditAccess = isOwner || ['owner', 'editor'].includes(userRole);

  return (
    <FullScreenDocumentEditor
      projectId={projectId}
      documentId={documentId}
      projectName={project.name}
      isReadOnly={!hasEditAccess}
    />
  );
}