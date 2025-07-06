import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LANDING_CONTENT } from "@/constants/landing";
import Link from "next/link";

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
            <h1 className="text-4xl md:text-6xl font-heading font-bold tracking-tight hero-text">
              SketchFlow
            </h1>
            <Badge variant="outline" className="text-xs">
              {hero.badge}
            </Badge>
          </div>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight hero-text">
            {hero.title}
          </h2>
          <h3 className="text-2xl md:text-4xl font-heading font-semibold tracking-tight text-muted-foreground">
            {hero.subtitle}
          </h3>
        </div>

        {/* Description */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          {hero.description}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href={hero.cta.primary_link} className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              {hero.cta.primary}
            </Button>
          </Link>
          <Link href={hero.cta.secondary_link} className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              {hero.cta.secondary}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}