"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Rocket, AlertCircle, CheckCircle2 } from "lucide-react";
import { createProject } from "@/lib/actions/projects";

interface ProjectFormProps {
  selectedTemplate: string;
}

export function ProjectForm({ selectedTemplate }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    visibility: "private"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    const form = new FormData();
    form.set('name', formData.name.trim());
    form.set('description', formData.description.trim());
    form.set('category', formData.category);
    form.set('visibility', formData.visibility);
    form.set('template', selectedTemplate);

    startTransition(async () => {
      try {
        await createProject(form);
        // createProject handles the redirect, so we don't need to do anything here
      } catch (err) {
        console.error('Error creating project:', err);
        setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
      }
    });
  };

  const isFormValid = formData.name.trim() && formData.category;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-foreground">
            Project Name *
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="My awesome project"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            disabled={isPending}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Choose a descriptive name for your project
          </p>
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-foreground">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe what this project is about..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            disabled={isPending}
            className="mt-1 resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Optional: Add context for collaborators
          </p>
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-foreground">
            Category *
          </Label>
          <Select
            name="category"
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
            disabled={isPending}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Technical
                </div>
              </SelectItem>
              <SelectItem value="business">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Business
                </div>
              </SelectItem>
              <SelectItem value="creative">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Creative
                </div>
              </SelectItem>
              <SelectItem value="design">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  Design
                </div>
              </SelectItem>
              <SelectItem value="planning">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Planning
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Helps organize and discover your projects
          </p>
        </div>

        <div>
          <Label htmlFor="visibility" className="text-sm font-medium text-foreground">
            Visibility
          </Label>
          <Select
            name="visibility"
            value={formData.visibility}
            onValueChange={(value) => handleInputChange('visibility', value)}
            disabled={isPending}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Private</span>
                  <span className="text-xs text-muted-foreground">Only you can access</span>
                </div>
              </SelectItem>
              <SelectItem value="team">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Team</span>
                  <span className="text-xs text-muted-foreground">Team members can access</span>
                </div>
              </SelectItem>
              <SelectItem value="public">
                <div className="flex flex-col items-start">
                  <span className="font-medium">Public</span>
                  <span className="text-xs text-muted-foreground">Anyone with link can view</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-4 border-t">
        <Button
          type="submit"
          className="w-full h-12 text-base font-medium"
          disabled={isPending || !isFormValid}
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Project...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 mr-2" />
              Create Project
            </>
          )}
        </Button>

        {!isFormValid && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Please fill in the required fields to continue
          </p>
        )}
      </div>
    </form>
  );
}