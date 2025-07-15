"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Share
} from "lucide-react";
import Link from "next/link";
import { deleteProject } from '@/lib/actions/projects';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

interface ProjectDropdownProps {
  project: {
    id: string;
    name: string;
  };
}

export function ProjectDropdown({ project }: ProjectDropdownProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      setIsDeleting(true);
      await deleteProject(project.id, user.id);
      router.refresh(); // Refresh the page to show updated project list
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link
              href={`/project/${project.id}`}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Open Project
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="flex items-center gap-2 text-red-600 focus:text-red-600">
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{project.name}&quot;? This action cannot be undone.
            All documents, canvases, and collaborators will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete Project'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}