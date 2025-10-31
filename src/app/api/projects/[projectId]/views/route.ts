import { NextRequest, NextResponse } from 'next/server';
import { incrementProjectViews, getProject } from '@/lib/actions/projects';
import { stackServerApp } from '@/lib/stack';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const { projectId } = await params;
        console.log('View tracking API called for project:', projectId);

        const body = await request.json() as { userId?: string };
        const { userId } = body;
        console.log('Request body:', { userId });

        // Get current user from Stack Auth
        const currentUser = await stackServerApp.getUser();
        const actualUserId = currentUser?.id || userId;
        console.log('Current user:', currentUser?.id, 'Actual user ID:', actualUserId);

        // Get project to check if it exists and get owner info
        const project = await getProject(projectId, actualUserId);
        console.log('Project found:', !!project, 'Owner ID:', project?.ownerId);

        if (!project) {
            console.log('Project not found for ID:', projectId);
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Don't count views from the project owner
        if (actualUserId && project.ownerId === actualUserId) {
            console.log('View not counted - user is project owner');
            return NextResponse.json(
                { message: 'View not counted for project owner' },
                { status: 200 }
            );
        }

        console.log('Incrementing view count for project:', projectId);
        // Increment the view count
        const result = await incrementProjectViews(projectId);
        console.log('Increment result:', result);

        if (result.success) {
            return NextResponse.json(
                { message: 'View tracked successfully' },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { error: 'Failed to track view' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in view tracking API:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}