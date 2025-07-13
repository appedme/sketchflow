import { EmbedCanvas } from '@/components/project/EmbedCanvas';

interface EmbedProjectPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    toolbar?: string;
    edit?: string;
  }>;
}

export default async function EmbedProjectPage({ params, searchParams }: EmbedProjectPageProps) {
  const { id: projectId } = await params;
  const { toolbar = 'true', edit = 'false' } = await searchParams;

  const showToolbar = toolbar === 'true';
  const allowEdit = edit === 'true';

  // Mock project data - in real app, fetch from database
  const project = {
    id: projectId,
    name: "Embedded Project",
    description: "Project embedded via iframe",
  };

  return (
    <EmbedCanvas
      projectId={projectId}
      projectName={project.name}
      showToolbar={showToolbar}
      allowEdit={allowEdit}
    />
  );
}

// Optimize for embedding
export const metadata = {
  title: 'Embedded Project - SketchFlow',
  robots: 'noindex, nofollow', // Prevent indexing of embed pages
};