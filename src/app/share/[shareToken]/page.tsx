import { notFound } from 'next/navigation';
import { getShare, getPublicProject } from '@/lib/actions/public-sharing';
import { PublicProjectWorkspace } from '@/components/project/PublicProjectWorkspace';
import { PublicDocumentViewer } from '@/components/project/PublicDocumentViewer';
import { PublicCanvasViewer } from '@/components/project/PublicCanvasViewer';

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
    // Get share data (no auth required for public shares)
    const shareData = await getShare(shareToken);

    if (!shareData) {
      notFound();
    }

    // Check if share has expired
    if (shareData.expiresAt && new Date(shareData.expiresAt) < new Date()) {
      notFound();
    }

    // Get the shared content (no auth required for public shares)
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
        <div className="min-h-screen bg-background">
          <PublicProjectWorkspace
            project={publicData}
            shareToken={shareToken}
            shareSettings={shareData}
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
          <PublicDocumentViewer
            documentId={shareData.documentId}
            projectId={(publicData as any).projectId}
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
          <PublicCanvasViewer
            canvasId={shareData.canvasId}
            projectId={(publicData as any).projectId}
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