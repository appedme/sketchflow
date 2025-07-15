import { notFound } from 'next/navigation';
import { getShare, getPublicProject } from '@/lib/actions/sharing';
import { ProjectWorkspace } from '@/components/project/ProjectWorkspace';
import { FullScreenDocumentEditor } from '@/components/project/FullScreenDocumentEditor';
import { FullScreenCanvasEditor } from '@/components/project/FullScreenCanvasEditor';

// Helper function to get the display name
const getDisplayName = (data: any) => {
  return data.name || data.title || 'Untitled';
};

interface SharePageProps {
  params: Promise<{
    shareToken: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { shareToken } = await params;

  try {
    // Get share data
    const shareData = await getShare(shareToken);
    
    if (!shareData) {
      notFound();
    }

    // Check if share has expired
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      notFound();
    }

    // Get the shared content
    const publicData = await getPublicProject(shareToken);
    
    if (!publicData) {
      notFound();
    }

    // Helper function to get the display name
    const getDisplayName = (data: any) => {
      return data.name || data.title || 'Untitled';
    };

    // Render based on share type
    if (shareData.projectId) {
      return (
        <div className="h-screen">
          <div className="bg-gray-100 border-b px-4 py-2 text-sm text-gray-600">
            <span className="font-medium">Shared Project:</span> {getDisplayName(publicData)}
          </div>
          <ProjectWorkspace 
            projectId={shareData.projectId}
            projectName={getDisplayName(publicData)}
            isReadOnly={shareData.shareType !== 'public'}
          />
        </div>
      );
    }

    if (shareData.documentId) {
      return (
        <div className="h-screen">
          <div className="bg-gray-100 border-b px-4 py-2 text-sm text-gray-600">
            <span className="font-medium">Shared Document:</span> {getDisplayName(publicData)}
          </div>
          <FullScreenDocumentEditor
            projectId={(publicData as any).projectId}
            documentId={shareData.documentId}
            projectName={getDisplayName(publicData)}
          />
        </div>
      );
    }

    if (shareData.canvasId) {
      return (
        <div className="h-screen">
          <div className="bg-gray-100 border-b px-4 py-2 text-sm text-gray-600">
            <span className="font-medium">Shared Canvas:</span> {getDisplayName(publicData)}
          </div>
          <FullScreenCanvasEditor
            projectId={(publicData as any).projectId}
            canvasId={shareData.canvasId}
            projectName={getDisplayName(publicData)}
          />
        </div>
      );
    }

    notFound();
  } catch (error) {
    console.error('Error loading shared content:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: SharePageProps) {
  const { shareToken } = await params;
  
  try {
    const shareData = await getShare(shareToken);
    const publicData = await getPublicProject(shareToken);
    
    if (!shareData || !publicData) {
      return {
        title: 'Shared Content - SketchFlow',
      };
    }

    let title = 'Shared Content';
    if (shareData.projectId) {
      title = `Shared Project: ${getDisplayName(publicData)}`;
    } else if (shareData.documentId) {
      title = `Shared Document: ${getDisplayName(publicData)}`;
    } else if (shareData.canvasId) {
      title = `Shared Canvas: ${getDisplayName(publicData)}`;
    }

    return {
      title: `${title} - SketchFlow`,
      description: (publicData as any).description || 'View shared content on SketchFlow',
    };
  } catch (error) {
    return {
      title: 'Shared Content - SketchFlow',
    };
  }
}