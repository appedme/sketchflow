import { Loading } from "@/components/ui/loading";

export function ProjectWorkspaceLoading() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loading size="lg" text="Preparing your workspace..." />
    </div>
  );
}