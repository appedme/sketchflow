"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

interface ProjectToolbarProps {
  projectName: string;
  onExport: (type: "png" | "svg" | "json") => void;
  onSave: () => void;
  onResetCanvas: () => void;
}

export function ProjectToolbar({
  projectName,
  onExport,
  onSave,
  onResetCanvas
}: ProjectToolbarProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <h1 className="font-heading font-semibold text-lg">{projectName}</h1>
          </div>
        </div>

        {/* Center Section - Essential Controls */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onResetCanvas}>
            Clear
          </Button>
        </div>

        {/* Right Section - Essential Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onExport("png")}>
            Export
          </Button>
          <Button size="sm" className="gap-2" onClick={onSave}>
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}