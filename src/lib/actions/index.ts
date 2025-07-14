// Export all server actions for easy importing
export * from './auth';
export * from './projects';
export * from './documents';
export * from './canvases';
export * from './templates';
export * from './files';
export * from './sharing';

// Initialize database with system templates
export async function initializeDatabase() {
  try {
    const { seedSystemTemplates } = await import('./templates');
    await seedSystemTemplates();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}