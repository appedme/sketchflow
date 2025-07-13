"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Share, 
  Copy, 
  Check,
  Globe,
  Lock,
  Code,
  Eye,
  ExternalLink,
  Mail,
  Twitter,
  Linkedin
} from "lucide-react";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
}

export function ShareDialog({ projectId, projectName }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [embedSize, setEmbedSize] = useState("medium");
  const [showToolbar, setShowToolbar] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://sketchflow.space";
  const projectUrl = `${baseUrl}/project/${projectId}`;
  const embedUrl = `${baseUrl}/embed/project/${projectId}`;
  
  const embedDimensions = {
    small: { width: 600, height: 400 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 800 }
  };

  const currentDimensions = embedDimensions[embedSize as keyof typeof embedDimensions];

  const generateEmbedCode = () => {
    const params = new URLSearchParams({
      toolbar: showToolbar.toString(),
      edit: allowEdit.toString(),
    });
    
    return `<iframe
  src="${embedUrl}?${params.toString()}"
  width="${currentDimensions.width}"
  height="${currentDimensions.height}"
  frameborder="0"
  allowfullscreen
  title="${projectName}">
</iframe>`;
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToSocial = (platform: string) => {
    const text = `Check out this project: ${projectName}`;
    const url = projectUrl;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(projectName)}&body=${encodeURIComponent(text + "\n\n" + url)}`,
    };

    if (shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Project
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="share" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="share" className="gap-2">
              <Share className="w-4 h-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-2">
              <Code className="w-4 h-4" />
              Embed Code
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Project Visibility</h3>
                  <p className="text-sm text-muted-foreground">
                    Control who can access your project
                  </p>
                </div>
                <Badge variant={isPublic ? "default" : "secondary"} className="gap-1">
                  {isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {isPublic ? "Public" : "Private"}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="public-access"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public-access">
                  Make project publicly accessible
                </Label>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="share-url">Share URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={projectUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(projectUrl, "url")}
                    className="gap-2"
                  >
                    {copied === "url" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied === "url" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Share on social media</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("twitter")}
                    className="gap-2"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("linkedin")}
                    className="gap-2"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => shareToSocial("email")}
                    className="gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="space-y-6 mt-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Embed Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Customize how your project appears when embedded
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="embed-size">Size</Label>
                  <Select value={embedSize} onValueChange={setEmbedSize}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (600x400)</SelectItem>
                      <SelectItem value="medium">Medium (800x600)</SelectItem>
                      <SelectItem value="large">Large (1200x800)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-toolbar"
                        checked={showToolbar}
                        onCheckedChange={setShowToolbar}
                      />
                      <Label htmlFor="show-toolbar" className="text-sm">
                        Show toolbar
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="allow-edit"
                        checked={allowEdit}
                        onCheckedChange={setAllowEdit}
                      />
                      <Label htmlFor="allow-edit" className="text-sm">
                        Allow editing
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="embed-code">Embed Code</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generateEmbedCode(), "embed")}
                    className="gap-2"
                  >
                    {copied === "embed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied === "embed" ? "Copied!" : "Copy Code"}
                  </Button>
                </div>
                <Textarea
                  id="embed-code"
                  value={generateEmbedCode()}
                  readOnly
                  className="font-mono text-sm min-h-[120px]"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Embed Preview</h4>
                <div className="text-sm text-muted-foreground">
                  Dimensions: {currentDimensions.width} x {currentDimensions.height}px
                </div>
                <div className="text-sm text-muted-foreground">
                  Toolbar: {showToolbar ? "Enabled" : "Disabled"} | Editing: {allowEdit ? "Enabled" : "Disabled"}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Live Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    See how your embedded project will look
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(embedUrl, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </Button>
              </div>

              <div className="border rounded-lg overflow-hidden bg-muted/20">
                <div className="bg-muted px-3 py-2 text-sm font-medium border-b">
                  Preview ({currentDimensions.width} x {currentDimensions.height})
                </div>
                <div className="p-4 flex justify-center">
                  <div 
                    className="border rounded shadow-sm bg-white overflow-hidden"
                    style={{
                      width: Math.min(currentDimensions.width, 600),
                      height: Math.min(currentDimensions.height, 400),
                    }}
                  >
                    <iframe
                      src={`${embedUrl}?toolbar=${showToolbar}&edit=${allowEdit}`}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      title={`${projectName} Preview`}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="bg-muted px-3 py-2 text-xs text-muted-foreground border-t">
                  This is a scaled preview. Actual embed will use the dimensions specified in settings.
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
