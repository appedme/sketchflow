import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/actions/auth';
import { getProjects, createProjectFromData } from '@/lib/actions/projects';

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

export async function POST(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description, category, visibility } = body;

        if (!name) {
            return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
        }

        const newProject = await createProjectFromData({
            name,
            description: description || '',
            category: category || 'general',
            visibility: visibility || 'private',
            ownerId: userId
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}