"use server";

import { auth, currentUser } from '@clerk/nextjs/server';
import { getDb } from '@/lib/db/connection';
import { users, type NewUser } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function createOrUpdateUser() {
  const { userId } = await auth();
  const user = await currentUser();
  
  if (!userId || !user) {
    throw new Error('User not authenticated');
  }

  try {
    const db = getDb();
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (existingUser.length === 0) {
      // Create new user
      const newUser: NewUser = {
        id: userId,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.imageUrl,
        preferences: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      await db.insert(users).values(newUser);
      return newUser;
    } else {
      // Update existing user
      const updatedUser = {
        email: user.emailAddresses[0]?.emailAddress || existingUser[0].email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.imageUrl,
        updatedAt: new Date().toISOString(),
      };
      
      await db.update(users).set(updatedUser).where(eq(users.id, userId));
      return { ...existingUser[0], ...updatedUser };
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw new Error('Failed to create or update user');
  }
}

export async function getUserProfile(userId: string) {
  try {
    const db = getDb();
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserPreferences(userId: string, preferences: Record<string, any>) {
  try {
    const db = getDb();
    await db.update(users).set({
      preferences,
      updatedAt: new Date().toISOString(),
    }).where(eq(users.id, userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update user preferences');
  }
}