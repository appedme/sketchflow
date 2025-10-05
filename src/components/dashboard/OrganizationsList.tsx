"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Users, Folder, Settings, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Organization {
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    plan: string;
  };
  membership: {
    role: string;
  };
}

export function OrganizationsList() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgSlug, setNewOrgSlug] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName || !newOrgSlug) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newOrgName,
          slug: newOrgSlug,
          description: newOrgDescription,
        }),
      });

      if (response.ok) {
        toast.success('Organization created!');
        setShowCreateDialog(false);
        setNewOrgName('');
        setNewOrgSlug('');
        setNewOrgDescription('');
        fetchOrganizations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create organization');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Organizations</h2>
          <p className="text-muted-foreground">
            Collaborate with your team in shared workspaces
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Organization</DialogTitle>
              <DialogDescription>
                Create a new organization to collaborate with your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Inc."
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value);
                    if (!newOrgSlug) {
                      setNewOrgSlug(generateSlug(e.target.value));
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  placeholder="acme-inc"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(generateSlug(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  This will be used in your organization's URL
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="What does your organization do?"
                  value={newOrgDescription}
                  onChange={(e) => setNewOrgDescription(e.target.value)}
                />
              </div>
              <Button
                onClick={handleCreateOrganization}
                disabled={creating}
                className="w-full"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {organizations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create an organization to collaborate with your team on projects
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {organizations.map(({ organization, membership }) => (
            <Card key={organization.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback>
                      <Building2 className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="outline">{membership.role}</Badge>
                </div>
                <CardTitle className="mt-4">{organization.name}</CardTitle>
                {organization.description && (
                  <CardDescription>{organization.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">{organization.plan}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/organizations/${organization.id}`}>
                      <Button variant="ghost" size="sm">
                        <Folder className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link href={`/organizations/${organization.id}/settings`}>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
