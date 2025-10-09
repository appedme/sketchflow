import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import { getCurrentUserId } from '@/lib/actions/auth';
import { getDb } from '@/lib/db/connection';
import { projects, documents, canvases, files, projectCollaborators, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(_request: NextRequest) {
  try {
    const userId = await getCurrentUserId();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    // Get user info
    const userInfo = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userInfo.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all projects owned by the user
    const ownedProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.ownerId, userId));

    // Get all projects where user is a collaborator
    const collaboratorProjects = await db
      .select({
        project: projects
      })
      .from(projectCollaborators)
      .innerJoin(projects, eq(projectCollaborators.projectId, projects.id))
      .where(and(
        eq(projectCollaborators.userId, userId),
        eq(projectCollaborators.acceptedAt, projectCollaborators.acceptedAt) // Not null
      ));

    const allProjects = [
      ...ownedProjects,
      ...collaboratorProjects.map(cp => cp.project)
    ];

    // Remove duplicates
    const uniqueProjects = allProjects.filter((project, index, self) =>
      index === self.findIndex(p => p.id === project.id)
    );

    // Create main ZIP file
    const mainZip = new JSZip();

    // Add account metadata
    const accountMetadata = {
      user: {
        id: userInfo[0].id,
        email: userInfo[0].email,
        firstName: userInfo[0].firstName,
        lastName: userInfo[0].lastName,
        createdAt: userInfo[0].createdAt
      },
      exportDate: new Date().toISOString(),
      version: '1.0',
      totalProjects: uniqueProjects.length,
      projects: uniqueProjects.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        category: project.category,
        visibility: project.visibility,
        status: project.status,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        isOwner: project.ownerId === userId
      }))
    };

    mainZip.file('account_metadata.json', JSON.stringify(accountMetadata, null, 2));

    // Process each project
    for (const project of uniqueProjects) {
      try {
        // Create project folder
        const projectFolder = mainZip.folder(project.name.replace(/[^a-zA-Z0-9]/g, '_'));

        if (!projectFolder) continue;

        // Fetch project data
        const [documentsData, canvasesData, filesData] = await Promise.all([
          db.select().from(documents).where(eq(documents.projectId, project.id)),
          db.select().from(canvases).where(eq(canvases.projectId, project.id)),
          db.select().from(files).where(eq(files.projectId, project.id))
        ]);

        // Add project metadata
        const projectMetadata = {
          project: {
            id: project.id,
            name: project.name,
            description: project.description,
            category: project.category,
            visibility: project.visibility,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
            tags: project.tags,
            status: project.status,
            isOwner: project.ownerId === userId
          },
          documents: documentsData.map(doc => ({
            id: doc.id,
            title: doc.title,
            wordCount: doc.wordCount,
            readingTime: doc.readingTime,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
          })),
          canvases: canvasesData.map(canvas => ({
            id: canvas.id,
            title: canvas.title,
            elementCount: canvas.elementCount,
            status: canvas.status,
            createdAt: canvas.createdAt,
            updatedAt: canvas.updatedAt
          })),
          files: filesData.map(file => ({
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            fileType: file.fileType,
            fileSize: file.fileSize,
            createdAt: file.createdAt
          }))
        };

        projectFolder.file('metadata.json', JSON.stringify(projectMetadata, null, 2));

        // Add documents
        if (documentsData.length > 0) {
          const docsFolder = projectFolder.folder('documents');
          if (docsFolder) {
            for (const doc of documentsData) {
              try {
                const content = doc.contentText || 'No content available';
                const markdownContent = `# ${doc.title}\n\n${content}\n\n---\n*Created: ${doc.createdAt}*\n*Updated: ${doc.updatedAt}*`;
                docsFolder.file(`${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, markdownContent);
              } catch (error) {
                console.error(`Error processing document ${doc.id}:`, error);
                docsFolder.file(`${doc.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`, `# ${doc.title}\n\nError processing content`);
              }
            }
          }
        }

        // Add canvases
        if (canvasesData.length > 0) {
          const canvasesFolder = projectFolder.folder('canvases');
          if (canvasesFolder) {
            for (const canvas of canvasesData) {
              try {
                const canvasData = {
                  type: 'excalidraw',
                  version: 2,
                  source: 'sketchflow',
                  elements: canvas.elements,
                  appState: canvas.appState,
                  files: canvas.files
                };
                canvasesFolder.file(`${canvas.title.replace(/[^a-zA-Z0-9]/g, '_')}.excalidraw`, JSON.stringify(canvasData, null, 2));
              } catch (error) {
                console.error(`Error processing canvas ${canvas.id}:`, error);
                canvasesFolder.file(`${canvas.title.replace(/[^a-zA-Z0-9]/g, '_')}.excalidraw`, JSON.stringify({ error: 'Failed to export canvas' }));
              }
            }
          }
        }

        // Note: Files are not included in the ZIP as they would require downloading from storage
        // The metadata includes file information for reference

      } catch (error) {
        console.error(`Error processing project ${project.id}:`, error);
        // Continue with other projects
      }
    }

    // Generate ZIP file
    const zipContent = await mainZip.generateAsync({ type: 'uint8array' });

    // Return ZIP file as response
    const safeUserName = `${userInfo[0].firstName || 'User'}_${userInfo[0].lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '_');
    return new NextResponse(zipContent, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${safeUserName}_account_export.zip"`,
      },
    });

  } catch (error) {
    console.error('Error exporting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}