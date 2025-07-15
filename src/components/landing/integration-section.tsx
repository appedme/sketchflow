import { Badge } from "@/components/ui/badge";

export function IntegrationSection() {
  const integrations = [
    { name: "Slack", logo: "🔗" },
    { name: "GitHub", logo: "🐙" },
    { name: "Notion", logo: "📝" },
    { name: "Figma", logo: "🎨" },
    { name: "Jira", logo: "🎯" },
    { name: "Confluence", logo: "📚" },
    { name: "Discord", logo: "💬" },
    { name: "Teams", logo: "👥" }
  ];

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Integrates with Your Workflow
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect SketchFlow with the tools you already use and love
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
          {integrations.map((integration, index) => (
            <div key={index} className="flex flex-col items-center space-y-3 p-4 rounded-lg hover:bg-background transition-colors">
              <div className="text-4xl">{integration.logo}</div>
              <span className="text-sm font-medium text-center">{integration.name}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Badge variant="secondary" className="px-4 py-2">
            More integrations coming soon
          </Badge>
        </div>
      </div>
    </section>
  );
}