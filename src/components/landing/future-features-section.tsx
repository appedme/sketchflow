import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, BookOpen, Share2, Zap, Globe } from "lucide-react";

export function FutureFeaturesSection() {
  const futureFeatures = [
    {
      title: "Community Sharing",
      description: "Share your projects with the community, discover inspiring work from others, and build your professional portfolio.",
      icon: Users,
      status: "Planned"
    },
    {
      title: "Real-time Commenting",
      description: "Collaborate seamlessly with threaded comments, mentions, and real-time feedback on any part of your projects.",
      icon: MessageSquare,
      status: "In Development"
    },
    {
      title: "Blog Publishing",
      description: "Transform your projects into beautiful blog posts and documentation with one-click publishing capabilities.",
      icon: BookOpen,
      status: "Planned"
    },
    {
      title: "Advanced Embedding",
      description: "Embed your projects anywhere with customizable viewers, interactive elements, and responsive design.",
      icon: Share2,
      status: "Planned"
    },
    {
      title: "Workflow Integrations",
      description: "Connect with your favorite tools like Slack, GitHub, Notion, and more for seamless workflow automation.",
      icon: Zap,
      status: "Planned"
    },
    {
      title: "Public Templates",
      description: "Access a growing library of community templates and share your own creations with the world.",
      icon: Globe,
      status: "Planned"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Development":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "Planned":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-bitcount-heading">
            Coming Soon: Next-Level Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the future of visual collaboration. Here's what's coming to make SketchFlow even more powerful.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {futureFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-dashed border-2 opacity-80 hover:opacity-100 transition-opacity">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <Badge className={`text-xs ${getStatusColor(feature.status)}`}>
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bitcount">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>

                {/* Coming Soon Overlay */}
                <div className="absolute top-2 right-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Soon
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Badge variant="outline" className="px-6 py-2 text-sm">
            🚀 Stay tuned for these exciting features!
          </Badge>
          <p className="text-sm text-muted-foreground mt-4 max-w-lg mx-auto">
            Want to be notified when these features launch? Join our community and be the first to know about new releases.
          </p>
        </div>
      </div>
    </section>
  );
}