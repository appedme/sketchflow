import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, Building, GraduationCap, Calendar } from "lucide-react";
import { LANDING_CONTENT } from "@/constants/landing";

const iconMap = {
  Code,
  Building,
  GraduationCap,
  Calendar,
} as const;

export function UseCasesSection() {
  const { useCases } = LANDING_CONTENT;

  return (
    <section id="use-cases" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
            Perfect for Every Use Case
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From software development to education, SketchFlow adapts to your visual collaboration needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((useCase, index) => {
            const Icon = iconMap[useCase.icon as keyof typeof iconMap];
            
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}