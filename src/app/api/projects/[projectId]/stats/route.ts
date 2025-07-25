import { NextRequest, NextResponse } from 'next/server';
import { getProject } from '@/lib/actions/projects';
import { stackServerApp } from '@/lib/stack';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        console.log('Stats API called for project:', projectId);

        // Get current user from Stack Auth
        const currentUser = await stackServerApp.getUser();
        console.log('Current user for stats:', currentUser?.id);

        // Get project data
        const project = await getProject(projectId, currentUser?.id);
        console.log('Project found for stats:', !!project, 'View count:', project?.viewCount);

        if (!project) {
            console.log('Project not found for stats, ID:', projectId);
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Return project stats
        const stats = {
            viewCount: project.viewCount || 0,
            lastActivityAt: project.lastActivityAt,
            updatedAt: project.updatedAt,
        };
        console.log('Returning stats:', stats);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching project stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}