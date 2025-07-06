"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LANDING_CONTENT } from "@/constants/landing";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export function Navigation() {
  const { navigation } = LANDING_CONTENT;
  const { isSignedIn, user } = useUser();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-heading font-bold brand-text">{navigation.brand}</span>
            <Badge variant="outline" className="text-xs">BETA</Badge>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user?.fullName || user?.emailAddresses[0]?.emailAddress}
                </span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    {navigation.auth.dashboard}
                  </Button>
                </Link>
                <SignOutButton>
                  <Button variant="ghost" size="sm">
                    Sign Out
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    {navigation.auth.signIn}
                  </Button>
                </Link>
                <Link href="/join">
                  <Button size="sm">
                    {navigation.auth.join}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}