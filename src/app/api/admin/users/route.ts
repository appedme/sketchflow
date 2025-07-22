import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack';
import { getDb } from '@/lib/db/connection';
import { users } from '@/lib/db/schema';

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

    const db = getDb();
    
    // Get all users
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .orderBy(users.createdAt);

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}