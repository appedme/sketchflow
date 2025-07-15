"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectFormProps {
  onSubmit: (formData: FormData) => void;
}

export function ProjectForm({ onSubmit }: ProjectFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("blank");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set('template', selectedTemplate);
    onSubmit(formData);
  };

  return (
    <Card className="border-gray-200 sticky top-8">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-900">Project Details</CardTitle>
        <CardDescription className="text-gray-500">
          Basic information about your project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Project Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter project name"
                required
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Brief description of your project"
                rows={3}
                className="mt-1 border-gray-200"
              />
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
              <Select name="category">
                <SelectTrigger className="mt-1 border-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility" className="text-sm font-medium text-gray-700">Visibility</Label>
              <Select name="visibility" defaultValue="private">
                <SelectTrigger className="mt-1 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              Selected template: <span className="font-medium">{selectedTemplate}</span>
            </div>

            <Button type="submit" className="w-full  mt-6">
              Create Project
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}