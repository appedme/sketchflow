import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/actions/projects";
import { NewProjectForm } from "@/components/dashboard/NewProjectForm";

export default async function NewProjectPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const handleFormSubmit = async (formData: FormData) => {
    "use server";
    await createProject(formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Create New Project</h1>
            <p className="text-gray-600">
              Choose a template to get started or create from scratch
            </p>
          </div>
        </div>

        <NewProjectForm onSubmit={handleFormSubmit} />
      </div>
    </div>
  );
}