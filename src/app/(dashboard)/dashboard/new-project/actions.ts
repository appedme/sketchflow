'use server';

import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
  // Extract form data
  const projectName = formData.get('projectName') as string;
  const projectDescription = formData.get('projectDescription') as string;
  const projectCategory = formData.get('projectCategory') as string;
  const projectVisibility = formData.get('projectVisibility') as string;
  const templateId = formData.get('templateId') as string;

  // In a real app, you would:
  // 1. Validate the data
  // 2. Save to database
  // 3. Create initial project structure
  // 4. Set up permissions based on visibility

  // For now, we'll simulate creating a project and redirect
  const projectId = Math.random().toString(36).substr(2, 9);
  
  // Simulate database save delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Redirect to the new project
  redirect(`/project/${projectId}`);
}