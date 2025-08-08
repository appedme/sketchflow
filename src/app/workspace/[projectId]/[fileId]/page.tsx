import { stackServerApp } from '@/lib/stack';
import { redirect, notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { WorkspaceShell } from '@/components/workspace/WorkspaceShell';

interface WorkspacePageProps {
    params: Promise<{
        projectId: string;
        fileId: string;
    }>;
    searchParams: Promise<{
        split?: string; // Additional file IDs for split view
        layout?: 'horizontal' | 'vertical';
    }>;
}

export default async function WorkspacePage({ params, searchParams }: WorkspacePageProps) {
    const user = await stackServerApp.getUser();
    const { projectId, fileId } = await params;
    const { split, layout = 'horizontal' } = await searchParams;

    // Fetch project data
    const project = await getProject(projectId, user?.id);

    if (!project) {
        notFound();
    }

    // Handle authentication
    if (!user) {
        if (project.visibility === 'public') {
            return (
                <WorkspaceShell
                    projectId={projectId}
                    primaryFileId={fileId}
                    splitFileIds={split ? split.split(',') : []}
                    layout={layout}
                    project={project}
                    currentUser={null}
                    isReadOnly={true}
                    isPublicView={true}
                />
            );
        } else {
            redirect(`/sign-in?redirect=${encodeURIComponent(`/workspace/${projectId}/${fileId}`)}`);
        }
    }

    // Check permissions
    const isOwner = project.ownerId === user.id;
    const userRole = project.userRole || 'viewer';
    const hasEditAccess = isOwner || ['owner', 'editor'].includes(userRole);

    // Serialize user data
    const serializedUser = {
        id: user.id,
        displayName: user.displayName,
        primaryEmail: user.primaryEmail,
        profileImageUrl: user.profileImageUrl
    };

    return (
        <WorkspaceShell
            projectId={projectId}
            primaryFileId={fileId}
            splitFileIds={split ? split.split(',') : []}
            layout={layout}
            project={project}
            currentUser={serializedUser}
            isReadOnly={!hasEditAccess}
            isPublicView={project.visibility === 'public' && !hasEditAccess}
        />
    );
}