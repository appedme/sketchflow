"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LANDING_CONTENT } from "@/constants/landing";
import { useUser, useStackApp } from "@stackframe/stack";
import Link from "next/link";
import { Menu, X, Sparkles, Zap, Users, BookOpen, ArrowRight, User, Settings, LogOut, LayoutDashboard, Palette, Code, Building, GraduationCap, Calendar, Search, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Visual Diagramming",
    description: "Create flowcharts, mind maps, and technical diagrams",
    icon: Palette,
    href: "#features"
  },
  {
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time",
    icon: Users,
    href: "#features"
  },
  {
    title: "Documentation",
    description: "Seamless markdown integration with diagrams",
    icon: BookOpen,
    href: "#features"
  },
  {
    title: "Templates",
    description: "Pre-built templates for common use cases",
    icon: Zap,
    href: "/dashboard/new-project"
  }
];

const useCases = [
  { title: "Software Development", icon: Code, href: "#use-cases" },
  { title: "Business Process", icon: Building, href: "#use-cases" },
  { title: "Education", icon: GraduationCap, href: "#use-cases" },
  { title: "Project Management", icon: Calendar, href: "#use-cases" },
  { title: "Research", icon: Search, href: "#use-cases" },
  { title: "Content Planning", icon: PenTool, href: "#use-cases" }
];

export function Navigation() {
  const { navigation } = LANDING_CONTENT;
  const user = useUser();
  const stackApp = useStackApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitials = () => {
    if (user?.displayName) {
      return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (user?.primaryEmail) {
      return user.primaryEmail[0].toUpperCase();
    }
    return 'U';
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled
        ? "bg-background/95 backdrop-blur-lg border-b shadow-sm"
        : "bg-background/80 backdrop-blur-md border-b border-transparent"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group" >
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 group-hover:scale-105 transition-transform" />
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {navigation.brand}
              </span>
              <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary border-primary/20">
                BETA
              </Badge>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      Home
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Features
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[500px] grid-cols-2">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <Link
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-primary/20 to-primary/10 p-6 no-underline outline-none focus:shadow-md"
                            href="#features"
                          >
                            <Zap className="h-6 w-6 text-primary" />
                            <div className="mb-2 mt-4 text-lg font-medium">
                              Powerful Features
                            </div>
                            <p className="text-sm leading-tight text-muted-foreground">
                              Everything you need to create, collaborate, and share visual projects.
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </div>
                      {features.map((feature) => (
                        <NavigationMenuLink key={feature.title} asChild>
                          <Link
                            href={feature.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <feature.icon className="h-4 w-4 text-primary" />
                              <div className="text-sm font-medium leading-none">{feature.title}</div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {feature.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium">
                    Use Cases
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[600px] grid-cols-3">
                      {useCases.map((useCase) => (
                        <NavigationMenuLink key={useCase.title} asChild>
                          <Link
                            href={useCase.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="flex items-center gap-2">
                              <useCase.icon className="h-4 w-4 text-primary" />
                              <div className="text-sm font-medium leading-none">{useCase.title}</div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/pricing" className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50">
                      Pricing
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard" className="hidden sm:block" >
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl || ""} alt={user?.displayName || ""} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        {user?.displayName && (
                          <p className="font-medium">{user.displayName}</p>
                        )}
                        {user?.primaryEmail && (
                          <p className="w-[200px] truncate text-sm text-muted-foreground">
                            {user.primaryEmail}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => stackApp.signOut()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/sign-in" className="hidden sm:block" >
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/join" >
                  <Button size="sm" className="gap-2">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-2">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-lg font-bold">{navigation.brand}</span>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Link
                        href="/"
                        className="text-sm font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Home
                      </Link>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground px-3">Features</h4>
                        {features.map((feature) => (
                          <Link
                            key={feature.title}
                            href={feature.href}
                            className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <feature.icon className="h-4 w-4 text-primary" />
                            <div>
                              <div className="text-sm font-medium">{feature.title}</div>
                              <div className="text-xs text-muted-foreground">{feature.description}</div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground px-3">Use Cases</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {useCases.map((useCase) => (
                            <Link
                              key={useCase.title}
                              href={useCase.href}
                              className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent transition-colors text-sm"
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <useCase.icon className="h-4 w-4 text-primary" />
                              {useCase.title}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <Link
                        href="/pricing"
                        className="text-sm font-medium py-2 px-3 rounded-md hover:bg-accent transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Pricing
                      </Link>
                    </div>

                    {!user && (
                      <div className="flex flex-col gap-3 pt-4 border-t">
                        <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} >
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </Link>
                        <Link href="/join" onClick={() => setIsMobileMenuOpen(false)} >
                          <Button className="w-full gap-2">
                            Get Started
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}