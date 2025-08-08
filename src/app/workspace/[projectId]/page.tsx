import { stackServerApp } from '@/lib/stack';
import { redirect, notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { UnifiedWorkspace } from '@/components/workspace/UnifiedWorkspace';

interface WorkspaceProjectPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export default async function WorkspaceProjectPage({ params }: WorkspaceProjectPageProps) {
    const user = await stackServerApp.getUser();
    const { projectId } = await params;

    // Fetch project data
    const project = await getProject(projectId, user?.id);

    if (!project) {
        notFound();
    }

    // Handle authentication
    if (!user && project.visibility !== 'public') {
        redirect(`/sign-in?redirect=${encodeURIComponent(`/workspace/${projectId}`)}`);
    }

    // Determine permissions
    const isOwner = project.ownerId === user?.id;
    const userRole = project.userRole || 'viewer';
    const hasEditAccess = isOwner || ['owner', 'editor'].includes(userRole);

    // Serialize user data
    const serializedUser = user ? {
        id: user.id,
        displayName: user.displayName,
        primaryEmail: user.primaryEmail,
        profileImageUrl: user.profileImageUrl
    } : null;

    return (
        <UnifiedWorkspace
            projectId={projectId}
            project={project}
            currentUser={serializedUser}
            isReadOnly={!hasEditAccess}
            isPublicView={project.visibility === 'public' && !hasEditAccess}
        />
    );
}