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
  const { id } = await params;

  // Fetch real project data from database
  const project = await getProject(id, user?.id);

  if (!project) {
    notFound();
  }

  // Check if user is signed in
  if (!user) {
    // If project is public, allow viewing without authentication
    if (project.visibility === 'public') {
      return (
        <ProjectWorkspace
          projectId={id}
          projectName={project.name}
          isReadOnly={true}
          isPublicView={true}
          project={project}
          currentUser={null}
        />
      );
    } else {
      // If project is private, redirect to sign in
      redirect('/sign-in');
    }
  }

  // Determine if user has edit access
  const isOwner = project.ownerId === user.id;
  const userRole = project.userRole || 'viewer';
  const hasEditAccess = isOwner || ['owner', 'editor'].includes(userRole);

  // Serialize user data for client component
  const serializedUser = user ? {
    id: user.id,
    displayName: user.displayName,
    primaryEmail: user.primaryEmail,
    profileImageUrl: user.profileImageUrl
  } : null;

  return (
    <ProjectWorkspace
      projectId={id}
      projectName={project.name}
      isReadOnly={!hasEditAccess}
      isPublicView={project.visibility === 'public' && !hasEditAccess}
      project={project}
      currentUser={serializedUser}
    />
  );
}