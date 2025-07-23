"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Eye,
  Mail,
  Twitter,
  Linkedin
} from "lucide-react";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  itemType?: 'project' | 'document' | 'canvas';
  itemId?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  projectVisibility?: string;
}

export function ShareDialog({
  projectId,
  projectName,
  itemType = 'project',
  itemId,
  isOpen: externalIsOpen,
  onOpenChange: externalOnOpenChange,
  projectVisibility = 'private'
}: ShareDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;
  const [copied, setCopied] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(projectVisibility === 'public');
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = process.env.NODE_ENV === 'production' ? "https://sketchflow.space" : (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

  // Update project visibility and get direct URL
  const updateProjectVisibility = async () => {
    setLoading(true);
    setError(null);

    try {
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

      // Return direct project URL
      const directUrl = `${baseUrl}/project/${projectId}`;
      setShareData({ shareUrl: directUrl, embedUrl: `${baseUrl}/embed/project/${projectId}` });
      return { shareUrl: directUrl, embedUrl: `${baseUrl}/embed/project/${projectId}` };
    } catch (err) {
      setError('Failed to update project visibility');
      console.error('Error updating visibility:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getShareUrl = () => {
    if (!isPublic) return '';
    return `${baseUrl}/project/${projectId}`;
  };

  const getEmbedUrl = () => {
    if (!isPublic) return '';
    return `${baseUrl}/embed/project/${projectId}`;
  };


  // Auto-update when dialog opens or visibility changes
  useEffect(() => {
    if (isOpen && isPublic && !loading) {
      updateProjectVisibility();
    }
  }, [isOpen, isPublic]);

  // Handle public toggle change
  const handlePublicToggle = async (checked: boolean) => {
    setIsPublic(checked);
    setShareData(null);
    if (checked) {
      updateProjectVisibility();
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
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
              {!isPublic && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Project is Private</span>
                  </div>
                  <p>This project is currently private. Enable "Make project publicly accessible" above to share it with others.</p>
                </div>
              )}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {error}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={isPublic ? getShareUrl() : "Make project public to generate share link"}
                  readOnly
                  className="flex-1"
                  disabled={!isPublic}
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(getShareUrl(), "url")}
                  className="gap-2"
                  disabled={!isPublic}
                >
                  {copied === "url" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied === "url" ? "Copied!" : "Copy Link"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Share on Social Media</h4>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("twitter")}
                  className="gap-2"
                  disabled={!isPublic}
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("linkedin")}
                  className="gap-2"
                  disabled={!isPublic}
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => shareToSocial("email")}
                  className="gap-2"
                  disabled={!isPublic}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
