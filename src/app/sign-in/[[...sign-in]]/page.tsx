import { SignIn } from "@stackframe/stack";

interface SignInPageProps {
  searchParams: Promise<{
    redirect?: string;
  }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { redirect } = await searchParams;
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to your SketchFlow account
          </p>
        </div>

        <SignIn 
          afterSignIn={redirect ? `/dashboard?redirect=${encodeURIComponent(redirect)}` : "/dashboard"}
        />
      </div>
    </div>
  );
}