import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDb } from '@/lib/db/connection';
import { projects, shares } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
    try {
        const user = await stackServerApp.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json() as { projectId: string };
        const { projectId } = body;

        if (!projectId) {
            return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
        }

        const db = getDb();

        // Verify project exists and user owns it
        const project = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId))
            .limit(1);

        if (project.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project[0].ownerId !== user.id) {
            return NextResponse.json({ error: 'Not authorized to share this project' }, { status: 403 });
        }

        // Check if share already exists
        const existingShare = await db
            .select()
            .from(shares)
            .where(eq(shares.projectId, projectId))
            .limit(1);

        let shareToken;

        if (existingShare.length > 0) {
            // Return existing share token
            shareToken = existingShare[0].shareToken;
        } else {
            // Create new share
            shareToken = nanoid(32); // Longer token for better security

            await db.insert(shares).values({
                id: nanoid(),
                projectId,
                shareToken,
                shareType: 'public',
                createdBy: user.id,
                createdAt: new Date().toISOString()
            });
        }

        // Update project to public visibility
        await db
            .update(projects)
            .set({
                visibility: 'public',
                updatedAt: new Date().toISOString()
            })
            .where(eq(projects.id, projectId));

        const baseUrl = process.env.NODE_ENV === 'production' 
            ? "https://sketchflow.space" 
            : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const shareUrl = `${baseUrl}/share/${shareToken}`;
        const embedUrl = `${baseUrl}/embed/project/${projectId}`;

        return NextResponse.json({ 
            shareToken,
            shareUrl,
            embedUrl
        }, { status: 200 });
    } catch (error) {
        console.error('Error creating share link:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}