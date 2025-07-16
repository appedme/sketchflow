"use client";

import { useState, useEffect } from "react";
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
  Linkedin,
  Loader2,
  Download
} from "lucide-react";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  itemType?: 'project' | 'document' | 'canvas';
  itemId?: string;
}

export function ShareDialog({
  projectId,
  projectName,
  itemType = 'project',
  itemId
}: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(false);
  const [embedSize, setEmbedSize] = useState("medium");
  const [showToolbar, setShowToolbar] = useState(true);
  const [allowEdit, setAllowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const targetItemId = itemId || projectId;
  const baseUrl = process.env.NODE_ENV === 'production' ? "https://sketchflow.space" : (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  const embedDimensions = {
    small: { width: 600, height: 400 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 800 }
  };

  const currentDimensions = embedDimensions[embedSize as keyof typeof embedDimensions];

  // Create or get share
  const createShare = async () => {
    if (shareData) return shareData;

    setLoading(true);
    setError(null);

    try {
      // First, update project visibility if needed
      if (isPublic && itemType === 'project') {
        const visibilityResponse = await fetch(`/api/projects/${projectId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            visibility: 'public',
          }),
        });

        if (!visibilityResponse.ok) {
          throw new Error('Failed to update project visibility');
        }
      }

      // Then create the share
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: targetItemId,
          itemType,
          settings: {
            shareType: isPublic ? 'public' : 'private',
            embedSettings: {
              toolbar: showToolbar,
              edit: allowEdit,
              size: embedSize,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create share');
      }

      const result = await response.json();
      setShareData(result);
      return result;
    } catch (err) {
      setError('Failed to create share link');
      console.error('Error creating share:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (!shareData) return '';
    return shareData.shareUrl;
  };

  const getEmbedUrl = () => {
    if (!shareData) return '';
    return shareData.embedUrl;
  };

  const generateEmbedCode = () => {
    const embedUrl = getEmbedUrl();
    if (!embedUrl) return '';

    return `<iframe
  src="${embedUrl}"
  width="${currentDimensions.width}"
  height="${currentDimensions.height}"
  frameborder="0"
  allowfullscreen
  title="${projectName}">
</iframe>`;
  };

  // Auto-create share when dialog opens
  useEffect(() => {
    if (isOpen && !shareData && !loading) {
      createShare();
    }
  }, [isOpen]);

  // Handle public toggle change
  const handlePublicToggle = async (checked: boolean) => {
    setIsPublic(checked);
    if (shareData) {
      // Clear existing share data to force recreation with new settings
      setShareData(null);
    }
  };

  const exportProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/export`);
      if (!response.ok) throw new Error('Failed to export project');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${projectName}-export.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting project:', error);
      alert('Failed to export project. Please try again.');
    }
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
    const shareUrl = getShareUrl();
    if (!shareUrl) return;

    const text = `Check out this ${itemType}: ${projectName}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      email: `mailto:?subject=${encodeURIComponent(`Check out: ${projectName}`)}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`,
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share" className="gap-2">
              <Share className="w-4 h-4" />
              Share Link
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-2">
              <Code className="w-4 h-4" />
              Embed Code
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
                  onCheckedChange={handlePublicToggle}
                />
                <Label htmlFor="public-access">
                  Make project publicly accessible
                </Label>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="share-url">Share URL</Label>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={loading ? "Generating share link..." : getShareUrl()}
                    readOnly
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(getShareUrl(), "url")}
                    className="gap-2"
                    disabled={loading || !shareData}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : copied === "url" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {loading ? "Loading..." : copied === "url" ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-medium">Export Project</h4>
                <p className="text-sm text-muted-foreground">
                  Download all project files as JSON
                </p>
                <Button
                  variant="outline"
                  onClick={exportProject}
                  className="gap-2 w-full"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </Button>
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
                    disabled={loading || !shareData}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : copied === "embed" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {loading ? "Loading..." : copied === "embed" ? "Copied!" : "Copy Code"}
                  </Button>
                </div>
                <Textarea
                  id="embed-code"
                  value={loading ? "Generating embed code..." : generateEmbedCode()}
                  readOnly
                  className="font-mono text-sm min-h-[120px]"
                  disabled={loading}
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

        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
