import { Loading } from "@/components/loading";

function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loading size="lg" text="Welcome to SketchFlow..." />
    </div>
  );
}

export default LoadingPage;