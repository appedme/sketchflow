import { NextRequest, NextResponse } from 'next/server';
import { getTemplates } from '@/lib/actions/templates';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category') || undefined;
        const popularOnly = searchParams.get('popular') === 'true';

        const templates = await getTemplates(category, popularOnly);
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching templates:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}