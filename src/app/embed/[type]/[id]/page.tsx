import { notFound } from 'next/navigation';
import { getShare, getPublicProject } from '@/lib/actions/sharing';
import { PublicProjectWorkspace } from '@/components/project/PublicProjectWorkspace';

interface EmbedPageProps {
    params: {
        type: 'project' | 'document' | 'canvas';
        id: string;
    };
    searchParams: {
        token?: string;
    };
}

export default async function EmbedPage({ params, searchParams }: EmbedPageProps) {
    const { type, id } = params;
    const { token } = searchParams;

    if (!token) {
        notFound();
    }

    try {
        const share = await getShare(token);
        if (!share) {
            notFound();
        }

        const project = await getPublicProject(token);
        if (!project) {
            notFound();
        }

        return (
            <div className="min-h-screen bg-background">
                <PublicProjectWorkspace
                    project={project}
                    shareToken={token}
                    shareSettings={share}
                    isEmbedded={true}
                    embedType={type}
                    embedId={id}
                />
            </div>
        );
    } catch (error) {
        console.error('Error loading embedded project:', error);
        notFound();
    }
}