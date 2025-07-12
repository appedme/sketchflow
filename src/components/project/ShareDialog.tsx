"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Share, 
  Copy, 
  Mail, 
  MessageSquare, 
  Twitter, 
  Linkedin, 
  Facebook,
  Code,
  Eye,
  Edit,
  Settings,
  Check,
  Globe,
  Lock,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  children?: React.ReactNode;
}

export function ShareDialog({ projectId, projectName, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [accessLevel, setAccessLevel] = useState<"view" | "edit">("view");
  const [visibility, setVisibility] = useState<"public" | "team" | "private">("team");

  // Generate share URLs
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${baseUrl}/project/${projectId}`;
  const viewOnlyUrl = `${shareUrl}?mode=view`;
  const embedUrl = `${baseUrl}/embed/project/${projectId}`;

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareOptions = [
    {
      name: "Email",
      icon: Mail,
      action: () => {
        const subject = encodeURIComponent(`Check out this project: ${projectName}`);
        const body = encodeURIComponent(`I'd like to share this project with you: ${shareUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`);
      }
    },
    {
      name: "Slack",
      icon: MessageSquare,
      action: () => {
        const text = encodeURIComponent(`Check out this project: ${projectName} - ${shareUrl}`);
        window.open(`https://slack.com/intl/en-in/help/articles/201330736-Add-links-to-messages?text=${text}`);
      }
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        const text = encodeURIComponent(`Check out this project: ${projectName}`);
        const url = encodeURIComponent(shareUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`);
      }
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      action: () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`);
      }
    },
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        const url = encodeURIComponent(shareUrl);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
      }
    }
  ];

  const embedSizes = [
    { name: "Small", width: 600, height: 400 },
    { name: "Medium", width: 800, height: 600 },
    { name: "Large", width: 1200, height: 800 },
    { name: "Custom", width: 0, height: 0 }
  ];

  const [selectedSize, setSelectedSize] = useState(embedSizes[1]);
  const [customWidth, setCustomWidth] = useState(800);
  const [customHeight, setCustomHeight] = useState(600);

  const getEmbedCode = () => {
    const width = selectedSize.name === "Custom" ? customWidth : selectedSize.width;
    const height = selectedSize.name === "Custom" ? customHeight : selectedSize.height;
    
    return `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  allowfullscreen>
</iframe>`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Share className="w-4 h-4" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share "{projectName}"
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share">Share Options</TabsTrigger>
            <TabsTrigger value="embed">Embed</TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6">
            {/* Visibility Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Project Visibility</h3>
              <div className="flex gap-2">
                <Button
                  variant={visibility === "public" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisibility("public")}
                  className="gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Public
                </Button>
                <Button
                  variant={visibility === "team" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisibility("team")}
                  className="gap-2"
                >
                  <Users className="w-4 h-4" />
                  Team
                </Button>
                <Button
                  variant={visibility === "private" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVisibility("private")}
                  className="gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Private
                </Button>
              </div>
            </div>

            <Separator />

            {/* Access Level */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Access Level</h3>
              <div className="flex gap-2">
                <Button
                  variant={accessLevel === "view" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAccessLevel("view")}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Only
                </Button>
                <Button
                  variant={accessLevel === "edit" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAccessLevel("edit")}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Can Edit
                </Button>
              </div>
            </div>

            <Separator />

            {/* Share URL */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Share Link</h3>
              <div className="flex gap-2">
                <Input
                  value={accessLevel === "view" ? viewOnlyUrl : shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(accessLevel === "view" ? viewOnlyUrl : shareUrl, "url")}
                  className="gap-2"
                >
                  {copied === "url" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "url" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Social Share Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Share via</h3>
              <div className="grid grid-cols-5 gap-3">
                {shareOptions.map((option) => (
                  <Button
                    key={option.name}
                    variant="outline"
                    size="sm"
                    onClick={option.action}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <option.icon className="w-5 h-5" />
                    <span className="text-xs">{option.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6">
            {/* Embed Size Options */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Embed Size</h3>
              <div className="grid grid-cols-2 gap-2">
                {embedSizes.map((size) => (
                  <Button
                    key={size.name}
                    variant={selectedSize.name === size.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSize(size)}
                    className="justify-start"
                  >
                    {size.name}
                    {size.width > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {size.width}×{size.height}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Size Inputs */}
            {selectedSize.name === "Custom" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (px)</label>
                  <Input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    min="300"
                    max="1920"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (px)</label>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    min="200"
                    max="1080"
                  />
                </div>
              </div>
            )}

            <Separator />

            {/* Embed Code */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Embed Code</h3>
              <div className="relative">
                <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                  <code>{getEmbedCode()}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(getEmbedCode(), "embed")}
                  className="absolute top-2 right-2 gap-2"
                >
                  {copied === "embed" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied === "embed" ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Embed Preview */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Preview</h3>
              <div className="border rounded-md p-4 bg-muted/50">
                <div 
                  className="bg-white border rounded shadow-sm mx-auto"
                  style={{
                    width: Math.min(selectedSize.name === "Custom" ? customWidth : selectedSize.width, 400),
                    height: Math.min(selectedSize.name === "Custom" ? customHeight : selectedSize.height, 300) * 0.6,
                    maxWidth: "100%"
                  }}
                >
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    <Code className="w-6 h-6 mr-2" />
                    Embedded Project Preview
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}