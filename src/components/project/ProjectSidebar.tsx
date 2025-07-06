"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AppState } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import { Eye, EyeOff, Lock, Unlock } from "lucide-react";

interface ProjectSidebarProps {
  elements: ExcalidrawElement[];
  appState: Partial<AppState>;
  projectId: string;
}

export function ProjectSidebar({ elements, appState }: ProjectSidebarProps) {
  const layers = elements.map((element, index) => ({
    id: element.id,
    type: element.type,
    name: `${element.type} ${index + 1}`,
    visible: !element.isDeleted,
    locked: element.locked || false
  }));

  return (
    <div className="w-80 border-l bg-background overflow-y-auto">
      <div className="p-4 space-y-4">
        {/* Element Properties */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Properties</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fill Color</label>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded border cursor-pointer"></div>
                <div className="w-8 h-8 bg-green-500 rounded border cursor-pointer"></div>
                <div className="w-8 h-8 bg-red-500 rounded border cursor-pointer"></div>
                <div className="w-8 h-8 bg-yellow-500 rounded border cursor-pointer"></div>
                <div className="w-8 h-8 bg-purple-500 rounded border cursor-pointer"></div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Stroke Width</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                defaultValue="2" 
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Opacity</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                defaultValue="100" 
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Layers Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Layers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {layers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No elements yet
                </p>
              ) : (
                layers.map((layer) => (
                  <div
                    key={layer.id}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {layer.type}
                      </Badge>
                      <span className="text-sm">{layer.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Library */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Library</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {/* Placeholder library items */}
              <div className="aspect-square bg-muted rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:bg-muted/80">
                <span className="text-xs text-muted-foreground">+</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              Browse Library
            </Button>
          </CardContent>
        </Card>

        {/* Project Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Elements:</span>
              <span>{elements.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Canvas Size:</span>
              <span>Infinite</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Theme:</span>
              <span className="capitalize">{appState.theme || 'light'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}