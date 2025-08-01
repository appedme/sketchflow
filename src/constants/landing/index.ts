// Landing page constants
export const LANDING_CONTENT = {
  hero: {
    badge: "BETA",
    title: "Sketch. Document. Collaborate.",
    subtitle: "All in one place",
    description: " " || "Transform your ideas into visual stories with powerful diagramming and seamless documentation. Community sharing, commenting, and blog publishing features coming soon.",
    announcement: "Welcome to Sketchflow 👋",
    cta: {
      primary: "Start Creating",
      primary_link: "/dashboard",
      secondary_link: "/#use-cases",
      secondary: "Explore Use Cases"
    }
  },
  features: [
    {
      title: "Seamless Integration",
      description: "Seamless diagram and markdown integration",
      icon: "FileText"
    },
    {
      title: "Advanced Sharing (Coming Soon)",
      description: "Future features: Community sharing, real-time commenting, collaborative editing, and blog publishing capabilities",
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
    },
    {
      title: "Photo Gallery",
      description: "Create visual galleries and photo collections with drag-and-drop functionality for organizing images.",
      icon: "Image"
    },
    {
      title: "Kanban Boards",
      description: "Organize tasks and workflows with visual Kanban boards for agile project management and productivity.",
      icon: "Kanban"
    },
    {
      title: "System Design",
      description: "Design complex system architectures, database schemas, and technical infrastructure diagrams.",
      icon: "Network"
    },
    {
      title: "Kids Drawing",
      description: "Fun and creative drawing space for children with colorful tools and simple interface for artistic expression.",
      icon: "Paintbrush"
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