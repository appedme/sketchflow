import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PenTool, FileText, Share2, Zap } from "lucide-react";
import { BorderBeam } from "../magicui/border-beam";

export function HowItWorksSection() {
  const steps = [
    {
      icon: PenTool,
      title: "Create",
      description: "Start with powerful diagramming tools or choose from our template library",
      step: "01"
    },
    {
      icon: FileText,
      title: "Document",
      description: "Add rich documentation alongside your diagrams with our integrated editor",
      step: "02"
    },
    {
      icon: Share2,
      title: "Collaborate",
      description: "Share your projects with team members and collaborate in real-time",
      step: "03"
    },
    {
      icon: Zap,
      title: "Deploy",
      description: "Export or embed your projects anywhere with custom sharing options",
      step: "04"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            How SketchFlow Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to implementation in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <Card key={index} className="text-center relative">
                <CardHeader>
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                  <BorderBeam duration={8} size={100} />

                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}