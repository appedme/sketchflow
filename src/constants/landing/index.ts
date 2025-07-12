// Landing page constants
export const LANDING_CONTENT = {
  hero: {
    badge: "BETA",
    title: "Powerful diagramming & documentation",
    subtitle: "Without Limits",
    description: "SketchFlow combines powerful diagramming, documentation, and project management in one seamless platform. Create, organize, and manage your visual projects with ease anywhere, anytime.",
    announcement: "New: Project Embedding & Export Features",
    cta: {
      primary: "Go to Dashboard",
      primary_link: "/dashboard",
      secondary_link: "/learn-more",
      secondary: "Learn More"
    }
  },
  features: [
    {
      title: "Seamless Integration",
      description: "Seamless diagram and markdown integration",
      icon: "FileText"
    },
    {
      title: "Embed Anywhere",
      description: "Embed projects anywhere with custom options",
      icon: "Share"
    }
  ],
  useCases: [
    {
      title: "Software Development",
      description: "Create system architecture diagrams, flowcharts, and technical documentation for your development projects.",
      icon: "Code"
    },
    {
      title: "Business Process Mapping",
      description: "Visualize workflows, process flows, and organizational structures to improve business operations.",
      icon: "Building"
    },
    {
      title: "Education & Training",
      description: "Design educational materials, concept maps, and interactive learning resources for students.",
      icon: "GraduationCap"
    },
    {
      title: "Project Management",
      description: "Plan and organize your projects with Gantt charts, timelines, and visual project roadmaps to stay on track.",
      icon: "Calendar"
    },
    {
      title: "UI/UX Design",
      description: "Design user interfaces, create wireframes, and prototype user experiences with intuitive visual tools.",
      icon: "Palette"
    },
    {
      title: "Research & Analysis",
      description: "Organize research findings, create mind maps, and visualize data relationships for better insights.",
      icon: "Search"
    },
    {
      title: "Content Planning",
      description: "Plan content strategies, create editorial calendars, and organize creative workflows efficiently.",
      icon: "PenTool"
    },
    {
      title: "Personal Organization",
      description: "Organize personal goals, create habit trackers, and visualize life planning with customizable templates.",
      icon: "User"
    }
  ],
  navigation: {
    brand: "SketchFlow",
    links: [
      { label: "Home", href: "/" },
      { label: "Features", href: "#features" },
      { label: "Use Cases", href: "#use-cases" },
      { label: "Pricing", href: "/pricing" },
      { label: "Contact", href: "/contact" }
    ],
    auth: {
      dashboard: "Dashboard",
      profile: "Profile",
      signIn: "Sign In",
      join: "Join"
    }
  }
} as const;