import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/actions/auth';
import { getProjects } from '@/lib/actions/projects';

export async function GET(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projects = await getProjects(userId);
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}