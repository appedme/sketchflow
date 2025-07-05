// Landing page constants
export const LANDING_CONTENT = {
  hero: {
    badge: "BETA",
    title: "Visual Collaboration",
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
      title: "Real-time Collaboration",
      description: "Real-time collaboration with your team",
      icon: "Users"
    },
    {
      title: "Embed Anywhere",
      description: "Embed projects anywhere with custom options",
      icon: "Share"
    }
  ],
  navigation: {
    brand: "SketchFlow",
    links: [
      { label: "Home", href: "/" },
      { label: "Features", href: "#features" },
      { label: "Contact", href: "#contact" }
    ],
    auth: {
      dashboard: "Dashboard",
      profile: "Profile"
    }
  }
} as const;