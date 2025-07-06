// Landing page constants
export const LANDING_CONTENT = {
  hero: {
    badge: "BETA",
    title: "Powerful diagramming & documentation",
    subtitle: "Without Limits",
    description: "SketchFlow combines powerful diagramming, documentation, and real-time collaboration in one seamless platform. Create, share, and collaborate on visual projects with your team—anywhere, anytime.",
    announcement: "New: Project Embedding & Collaboration Features",
    cta: {
      primary: "Go to Dashboard",
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
      description: "Plan projects with Gantt charts, timelines, and visual project roadmaps to keep teams aligned.",
      icon: "Calendar"
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