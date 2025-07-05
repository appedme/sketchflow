import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LANDING_CONTENT } from "@/constants/landing";

export function HeroSection() {
  const { hero } = LANDING_CONTENT;

  return (
    <section className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-center">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Announcement Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="px-4 py-2 text-sm">
            {hero.announcement}
          </Badge>
        </div>

        {/* Brand and Beta */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              SketchFlow
            </h1>
            <Badge variant="outline" className="text-xs">
              {hero.badge}
            </Badge>
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
            {hero.title}
          </h2>
          <h3 className="text-2xl md:text-4xl font-bold tracking-tight text-muted-foreground">
            {hero.subtitle}
          </h3>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {hero.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Button size="lg" className="w-full sm:w-auto">
            {hero.cta.primary}
          </Button>
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            {hero.cta.secondary}
          </Button>
        </div>
      </div>
    </section>
  );
}