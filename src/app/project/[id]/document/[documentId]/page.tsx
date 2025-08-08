import { redirect } from 'next/navigation';

interface DocumentRedirectProps {
  params: Promise<{
    id: string;
    documentId: string;
  }>;
}

export default async function DocumentRedirect({ params }: DocumentRedirectProps) {
  const { id: projectId, documentId } = await params;

  // Redirect to new workspace route
  redirect(`/workspace/${projectId}/${documentId}`);
}