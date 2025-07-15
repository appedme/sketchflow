import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createShare } from '@/lib/actions/sharing';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: any = await request.json();
    const { itemId, itemType, settings } = body;

    if (!itemId || !itemType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const shareResult = await createShare(itemId, itemType, settings);

    return NextResponse.json(shareResult);
  } catch (error) {
    console.error('Error creating share:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}