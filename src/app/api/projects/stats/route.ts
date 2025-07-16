import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/actions/auth';
import { getProjectStats } from '@/lib/actions/projects';

export async function GET(request: NextRequest) {
    try {
        const userId = await getCurrentUserId();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await getProjectStats(userId);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching project stats:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}