import { stackServerApp } from '@/lib/stack';
import { redirect, notFound } from 'next/navigation';
import { getProject } from '@/lib/actions/projects';
import { UnifiedWorkspace } from '@/components/workspace/UnifiedWorkspace';
import { Metadata } from 'next';

interface WorkspaceProjectPageProps {
    params: Promise<{
        projectId: string;
    }>;
}

export async function generateMetadata({ params }: WorkspaceProjectPageProps): Promise<Metadata> {
    const { projectId } = await params;
    const project = await getProject(projectId);

    if (!project) {
        return {
            title: 'Workspace Not Found | SketchFlow',
            description: 'The requested workspace could not be found.',
        };
    }

    return {
        title: `${project.name} | SketchFlow Workspace`,
        description: project.description || `Collaborate on ${project.name} with SketchFlow - a unified workspace for documents and canvas drawings.`,
        openGraph: {
            title: `${project.name} | SketchFlow`,
            description: project.description || `Collaborate on ${project.name} with SketchFlow`,
            type: 'website',
            images: [
                {
                    url: '/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: `${project.name} - SketchFlow Workspace`,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${project.name} | SketchFlow`,
            description: project.description || `Collaborate on ${project.name} with SketchFlow`,
            images: ['/og-image.jpg'],
        },
    };
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