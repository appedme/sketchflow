"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown, Plus, Settings, User } from 'lucide-react';

interface Organization {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  membership: {
    role: string;
  };
}

export function OrganizationSwitcher() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    // Detect current organization from URL
    const match = pathname.match(/\/organizations\/([^/]+)/);
    if (match && organizations.length > 0) {
      const org = organizations.find(o => o.organization.id === match[1]);
      if (org) {
        setCurrentOrg(org);
      }
    }
  }, [pathname, organizations]);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
    }
  };

  if (organizations.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2 overflow-hidden">
            <Avatar className="w-6 h-6">
              <AvatarFallback>
                {currentOrg ? (
                  <Building2 className="w-3 h-3" />
                ) : (
                  <User className="w-3 h-3" />
                )}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">
              {currentOrg ? currentOrg.organization.name : 'Personal'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 ml-2 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Personal Workspace */}
        <Link href="/dashboard">
          <DropdownMenuItem className={!currentOrg ? 'bg-accent' : ''}>
            <div className="flex items-center gap-2 w-full">
              <Avatar className="w-6 h-6">
                <AvatarFallback>
                  <User className="w-3 h-3" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="font-medium">Personal</div>
                <div className="text-xs text-muted-foreground">Your workspace</div>
              </div>
            </div>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        
        {/* Organizations */}
        {organizations.map(({ organization, membership }) => (
          <Link key={organization.id} href={`/organizations/${organization.id}`}>
            <DropdownMenuItem 
              className={currentOrg?.organization.id === organization.id ? 'bg-accent' : ''}
            >
              <div className="flex items-center gap-2 w-full">
                <Avatar className="w-6 h-6">
                  <AvatarFallback>
                    <Building2 className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{organization.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {membership.role}
                    </Badge>
                  </div>
                </div>
                <Link 
                  href={`/organizations/${organization.id}/settings`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </DropdownMenuItem>
          </Link>
        ))}

        <DropdownMenuSeparator />
        
        {/* Create Organization */}
        <Link href="/organizations">
          <DropdownMenuItem>
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
