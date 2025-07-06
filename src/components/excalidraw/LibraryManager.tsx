"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Plus, 
  Download, 
  Star, 
  Grid, 
  List,
  Folder,
  Heart
} from "lucide-react";

interface LibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  elements: unknown[];
  thumbnail: string;
  downloads: number;
  rating: number;
  author: string;
  isPublic: boolean;
  isFavorite: boolean;
}

interface LibraryManagerProps {
  onInsertLibraryItem: (item: LibraryItem) => void;
  onClose: () => void;
}

export function LibraryManager({ onInsertLibraryItem, onClose }: LibraryManagerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("browse");

  // Mock library data - in real app, fetch from API
  const libraryItems: LibraryItem[] = [
    {
      id: "1",
      name: "AWS Architecture Icons",
      description: "Complete set of AWS service icons for cloud architecture diagrams",
      category: "cloud",
      tags: ["aws", "cloud", "architecture", "icons"],
      elements: [],
      thumbnail: "/api/placeholder/200/150",
      downloads: 1250,
      rating: 4.8,
      author: "AWS Team",
      isPublic: true,
      isFavorite: false
    },
    {
      id: "2",
      name: "Flowchart Symbols",
      description: "Standard flowchart symbols and decision shapes",
      category: "flowchart",
      tags: ["flowchart", "process", "symbols", "standard"],
      elements: [],
      thumbnail: "/api/placeholder/200/150",
      downloads: 890,
      rating: 4.6,
      author: "SketchFlow",
      isPublic: true,
      isFavorite: true
    },
    {
      id: "3",
      name: "UI Wireframe Kit",
      description: "Essential wireframe components for web and mobile design",
      category: "ui",
      tags: ["wireframe", "ui", "web", "mobile", "components"],
      elements: [],
      thumbnail: "/api/placeholder/200/150",
      downloads: 2100,
      rating: 4.9,
      author: "Design Team",
      isPublic: true,
      isFavorite: false
    },
    {
      id: "4",
      name: "Database ERD Symbols",
      description: "Entity relationship diagram symbols and connectors",
      category: "database",
      tags: ["database", "erd", "entity", "relationship", "sql"],
      elements: [],
      thumbnail: "/api/placeholder/200/150",
      downloads: 670,
      rating: 4.7,
      author: "DB Expert",
      isPublic: true,
      isFavorite: false
    },
    {
      id: "5",
      name: "Network Diagram Icons",
      description: "Network infrastructure and topology icons",
      category: "network",
      tags: ["network", "infrastructure", "topology", "cisco"],
      elements: [],
      thumbnail: "/api/placeholder/200/150",
      downloads: 540,
      rating: 4.5,
      author: "NetAdmin",
      isPublic: true,
      isFavorite: true
    }
  ];

  const categories = [
    { id: "all", name: "All Categories", count: libraryItems.length },
    { id: "cloud", name: "Cloud", count: libraryItems.filter(item => item.category === "cloud").length },
    { id: "flowchart", name: "Flowchart", count: libraryItems.filter(item => item.category === "flowchart").length },
    { id: "ui", name: "UI/UX", count: libraryItems.filter(item => item.category === "ui").length },
    { id: "database", name: "Database", count: libraryItems.filter(item => item.category === "database").length },
    { id: "network", name: "Network", count: libraryItems.filter(item => item.category === "network").length }
  ];

  const filteredItems = libraryItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInsertItem = useCallback((item: LibraryItem) => {
    onInsertLibraryItem(item);
    onClose();
  }, [onInsertLibraryItem, onClose]);

  const toggleFavorite = useCallback((itemId: string) => {
    // In real app, update favorite status in database
    console.log("Toggle favorite for item:", itemId);
  }, []);

  return (
    <div className="w-full h-full bg-background border-l">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-heading font-semibold">Library</h2>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search library items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-4">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="my-library">My Library</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col mt-4">
            {/* Categories */}
            <div className="px-4 mb-4">
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="gap-2"
                  >
                    <Folder className="w-3 h-3" />
                    {category.name}
                    <Badge variant="secondary" className="text-xs">
                      {category.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>

            {/* Library Items */}
            <div className="flex-1 overflow-y-auto px-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-sm">{item.name}</CardTitle>
                            <CardDescription className="text-xs mt-1">
                              by {item.author}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(item.id);
                            }}
                          >
                            <Heart className={`w-3 h-3 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="aspect-video bg-muted rounded mb-3 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">Preview</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {item.downloads}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {item.rating}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleInsertItem(item)}
                        >
                          Insert
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="cursor-pointer hover:shadow-sm transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-muted-foreground">IMG</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{item.name}</h4>
                            <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{item.category}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {item.downloads} downloads
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(item.id);
                              }}
                            >
                              <Heart className={`w-3 h-3 ${item.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleInsertItem(item)}
                            >
                              Insert
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="flex-1 p-4">
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No favorites yet</h3>
              <p className="text-sm text-muted-foreground">
                Heart items you love to find them here later
              </p>
            </div>
          </TabsContent>

          <TabsContent value="my-library" className="flex-1 p-4">
            <div className="text-center py-8">
              <Plus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Create your first library item</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Save your frequently used elements for quick access
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Library Item
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}