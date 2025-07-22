import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Share } from "lucide-react";
import { LANDING_CONTENT } from "@/constants/landing";
import { BorderBeam } from "../magicui/border-beam";

const iconMap = {
  FileText,
  Users,
  Share,
} as const;

export function FeaturesSection() {
  const { features } = LANDING_CONTENT;

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-bitcount-heading">
            Powerful Features
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to create, organize, and share your visual projects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];

            return (
              <Card key={index} className="text-center relative overflow-hidden   w-full">

                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bitcount">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
                <BorderBeam duration={8} size={100} />

              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}