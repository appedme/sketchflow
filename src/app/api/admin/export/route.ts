import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDb } from '@/lib/db/connection';
import { users, projects, documents, canvases } from '@/lib/db/schema';

const ADMIN_EMAIL = "sh20raj@gmail.com";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin access
    const user = await stackServerApp.getUser();
    
    if (!user || user.primaryEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const db = getDb();
    let data: any = {};

    switch (type) {
      case 'users':
        data.users = await db.select().from(users);
        break;
      case 'projects':
        data.projects = await db.select().from(projects);
        break;
      case 'documents':
        data.documents = await db.select().from(documents);
        break;
      case 'canvases':
        data.canvases = await db.select().from(canvases);
        break;
      case 'all':
      default:
        data = {
          users: await db.select().from(users),
          projects: await db.select().from(projects),
          documents: await db.select().from(documents),
          canvases: await db.select().from(canvases)
        };
        break;
    }

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="sketchflow_${type}_export_${new Date().toISOString().split('T')[0]}.json"`);

    return new NextResponse(JSON.stringify(data, null, 2), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}