import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code, Building, GraduationCap, Calendar, Palette, Search, PenTool, User, Image, FileImage, Kanban, Network, Paintbrush, ExternalLink } from "lucide-react";
import { LANDING_CONTENT } from "@/constants/landing";
import Link from "next/link";

import { BorderBeam } from "../magicui/border-beam";

const iconMap = {
  Code,
  Building,
  GraduationCap,
  Calendar,
  Palette,
  Search,
  PenTool,
  User,
  Image,
  FileImage,
  Kanban,
  Network,
  Paintbrush,
} as const;

export function UseCasesSection() {
  const { useCases } = LANDING_CONTENT;

  return (
    <section id="use-cases" className="py-20 px-4 bg-muted/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 font-bitcount-heading">
            Perfect for Every Use Case
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From software development to personal organization, SketchFlow adapts to your visual project needs
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
                  <CardTitle className="text-lg font-bitcount">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {useCase.description}
                  </CardDescription>
                  <BorderBeam duration={8} size={100} />
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link 
            href="https://sketchflow.space/project/yH1XpeBmbzD8pXONwoMaF" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button size="lg" className="gap-2 font-bitcount">
              Explore Sketchflow Usecases
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            See real examples and templates for every use case
          </p>
        </div>
      </div>
    </section>
  );
}