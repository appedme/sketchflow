import { notFound } from 'next/navigation';
import { getShare, getPublicProject } from '@/lib/actions/sharing';
import { PublicProjectWorkspace } from '@/components/project/PublicProjectWorkspace';

interface SharePageProps {
    params: {
        token: string;
    };
}

export default async function SharePage({ params }: SharePageProps) {
    const { token } = params;

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
                />
            </div>
        );
    } catch (error) {
        console.error('Error loading shared project:', error);
        notFound();
    }
}