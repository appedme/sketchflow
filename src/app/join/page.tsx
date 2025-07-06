import { SignUp } from '@clerk/nextjs';

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Join SketchFlow
          </h1>
          <p className="text-muted-foreground">
            Create your account to start collaborating visually
          </p>
        </div>
        
        <SignUp 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg border",
            }
          }}
          redirectUrl="/dashboard"
          signInUrl="/sign-in"
        />
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            By signing up, you agree to our{" "}
            <a href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}